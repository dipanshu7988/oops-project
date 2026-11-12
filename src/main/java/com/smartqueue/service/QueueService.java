package com.smartqueue.service;

import com.smartqueue.dto.CustomerStatusResponse;
import com.smartqueue.dto.JoinQueueRequest;
import com.smartqueue.dto.QueueEntryResponse;
import com.smartqueue.exception.DuplicateQueueException;
import com.smartqueue.exception.InvalidOperationException;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.entity.QueueHistory;
import com.smartqueue.model.entity.ServiceCounter;
import com.smartqueue.model.enums.NoShowRisk;
import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.QueueEntryRepository;
import com.smartqueue.repository.QueueHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Transactional
public class QueueService {

    private final QueueEntryRepository queueEntryRepository;
    private final QueueHistoryRepository queueHistoryRepository;
    private final CustomerService customerService;
    private final CounterService counterService;
    private final QrCodeService qrCodeService;
    private final int defaultServiceTimeMinutes;

    // Track token sequence per service: F, D, V, P
    private final Map<ServiceType, AtomicInteger> sequenceGenerators = new ConcurrentHashMap<>();

    // Rolling average service time in minutes per service type
    private final Map<ServiceType, Double> serviceAverages = new ConcurrentHashMap<>();

    public QueueService(QueueEntryRepository queueEntryRepository,
                        QueueHistoryRepository queueHistoryRepository,
                        CustomerService customerService,
                        CounterService counterService,
                        QrCodeService qrCodeService,
                        @Value("${smartqueue.default-service-time-minutes:3}") int defaultServiceTimeMinutes) {
        this.queueEntryRepository = queueEntryRepository;
        this.queueHistoryRepository = queueHistoryRepository;
        this.customerService = customerService;
        this.counterService = counterService;
        this.qrCodeService = qrCodeService;
        this.defaultServiceTimeMinutes = defaultServiceTimeMinutes;

        for (ServiceType type : ServiceType.values()) {
            sequenceGenerators.put(type, new AtomicInteger(100));
            serviceAverages.put(type, (double) defaultServiceTimeMinutes);
        }
    }

    public synchronized QueueEntryResponse joinQueue(JoinQueueRequest request) {
        Customer customer = customerService.getOrCreateCustomer(request.getName(), request.getPhoneNumber());

        // Check for active token in the same service type (WAITING, CHECKED_IN, or SERVING)
        boolean hasActiveToken = queueEntryRepository.existsByCustomerAndServiceTypeAndStatusIn(
                customer,
                request.getServiceType(),
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN, QueueStatus.SERVING)
        );

        if (hasActiveToken) {
            throw new DuplicateQueueException(
                    "Customer already has an active token for " + request.getServiceType().getDisplayName() + ". Please complete or cancel the existing ticket first."
            );
        }

        // Generate token number, e.g., D-101
        String tokenNumber = generateNextToken(request.getServiceType());

        QueueEntry entry = new QueueEntry(
                tokenNumber,
                customer,
                request.getServiceType(),
                request.getPriority()
        );

        // Generate QR Code data for customer check-in
        String qrBase64 = qrCodeService.generateQrCodeBase64(
                tokenNumber,
                customer.getName(),
                request.getServiceType(),
                entry.getJoinedAt()
        );
        entry.setQrCodePath(qrBase64);

        queueEntryRepository.save(entry);

        // Recalculate queue positions and wait times
        recalculateQueue(request.getServiceType());

        // Reload entry
        QueueEntry savedEntry = queueEntryRepository.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Failed to retrieve generated token"));

        return mapToResponse(savedEntry);
    }

    public QueueEntryResponse getQueueEntryByToken(String tokenNumber) {
        QueueEntry entry = queueEntryRepository.findByTokenNumber(tokenNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No queue entry found for token: " + tokenNumber));
        return mapToResponse(entry);
    }

    public CustomerStatusResponse getCustomerStatus(String tokenNumber) {
        QueueEntry entry = queueEntryRepository.findByTokenNumber(tokenNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No queue entry found for token: " + tokenNumber));

        int peopleAhead = entry.getStatus() == QueueStatus.WAITING ? Math.max(0, entry.getQueuePosition() - 1) : 0;
        String counter = entry.getAssignedCounter() != null ? entry.getAssignedCounter().getCounterName() : "Pending Assignment";

        return new CustomerStatusResponse(
                entry.getTokenNumber(),
                entry.getCustomer().getName(),
                peopleAhead,
                entry.getEstimatedWaitMinutes(),
                entry.getServiceType().getDisplayName(),
                entry.getPriority().getDisplayName(),
                entry.getStatus().getDisplayName(),
                counter,
                entry.getQueuePosition()
        );
    }

    public List<QueueEntryResponse> getQueueByService(ServiceType serviceType) {
        List<QueueEntry> entries = queueEntryRepository.findByServiceTypeAndStatusIn(
                serviceType,
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN, QueueStatus.SERVING)
        );
        entries.sort(getPriorityComparator());
        return entries.stream().map(this::mapToResponse).toList();
    }

    public List<QueueEntryResponse> getAllActiveQueue() {
        List<QueueEntry> entries = queueEntryRepository.findByStatusIn(
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN, QueueStatus.SERVING)
        );
        entries.sort(getPriorityComparator());
        return entries.stream().map(this::mapToResponse).toList();
    }

    public synchronized QueueEntryResponse serveCustomer(String tokenNumber, Long counterId) {
        QueueEntry entry = findEntryOrThrow(tokenNumber);

        if (entry.getStatus() != QueueStatus.WAITING && entry.getStatus() != QueueStatus.CHECKED_IN) {
            throw new InvalidOperationException(
                    "Only waiting or checked-in customers can be marked as serving. Current status is " + entry.getStatus().getDisplayName()
            );
        }

        entry.setStatus(QueueStatus.SERVING);
        entry.setServiceStartedAt(LocalDateTime.now());
        entry.setQueuePosition(0);
        entry.setEstimatedWaitMinutes(0);

        if (counterId != null) {
            ServiceCounter counter = counterService.getCounterById(counterId);
            entry.setAssignedCounter(counter);
        } else {
            // Pick first active counter for this service if available
            List<ServiceCounter> counters = counterService.getActiveCountersByService(entry.getServiceType());
            if (!counters.isEmpty()) {
                entry.setAssignedCounter(counters.get(0));
            }
        }

        queueEntryRepository.save(entry);
        recalculateQueue(entry.getServiceType());

        return mapToResponse(entry);
    }

    public synchronized QueueEntryResponse completeCustomer(String tokenNumber) {
        QueueEntry entry = findEntryOrThrow(tokenNumber);

        if (entry.getStatus() != QueueStatus.SERVING) {
            throw new InvalidOperationException(
                    "Only serving customers can be marked as completed. Current status is " + entry.getStatus().getDisplayName()
            );
        }

        LocalDateTime completedTime = LocalDateTime.now();
        entry.setStatus(QueueStatus.SERVED);
        entry.setServiceCompletedAt(completedTime);

        long durationMinutes = 1L;
        if (entry.getServiceStartedAt() != null) {
            long actual = Duration.between(entry.getServiceStartedAt(), completedTime).toMinutes();
            durationMinutes = Math.max(1L, actual);
        }

        // Record history
        QueueHistory history = new QueueHistory(entry, QueueStatus.SERVED, durationMinutes);
        queueHistoryRepository.save(history);

        // Update customer total visits
        customerService.incrementCustomerVisits(entry.getCustomer());

        // Update rolling average for this service type
        updateAverageServiceTime(entry.getServiceType(), durationMinutes);

        queueEntryRepository.save(entry);
        recalculateQueue(entry.getServiceType());

        return mapToResponse(entry);
    }

    public synchronized QueueEntryResponse skipCustomer(String tokenNumber) {
        QueueEntry entry = findEntryOrThrow(tokenNumber);

        if (entry.getStatus().isTerminal()) {
            throw new InvalidOperationException("Cannot skip customer in terminal status: " + entry.getStatus().getDisplayName());
        }

        entry.setStatus(QueueStatus.SKIPPED);
        entry.setServiceCompletedAt(LocalDateTime.now());

        QueueHistory history = new QueueHistory(entry, QueueStatus.SKIPPED, 0L);
        queueHistoryRepository.save(history);

        queueEntryRepository.save(entry);
        recalculateQueue(entry.getServiceType());

        return mapToResponse(entry);
    }

    public synchronized QueueEntryResponse markNoShow(String tokenNumber) {
        QueueEntry entry = findEntryOrThrow(tokenNumber);

        if (entry.getStatus().isTerminal()) {
            throw new InvalidOperationException("Cannot mark no-show for customer in terminal status: " + entry.getStatus().getDisplayName());
        }

        entry.setStatus(QueueStatus.NO_SHOW);
        entry.setServiceCompletedAt(LocalDateTime.now());

        // Record history
        QueueHistory history = new QueueHistory(entry, QueueStatus.NO_SHOW, 0L);
        queueHistoryRepository.save(history);

        // Increment customer no-show count
        customerService.incrementCustomerNoShows(entry.getCustomer());

        queueEntryRepository.save(entry);
        recalculateQueue(entry.getServiceType());

        return mapToResponse(entry);
    }

    public synchronized QueueEntryResponse cancelCustomer(String tokenNumber) {
        QueueEntry entry = findEntryOrThrow(tokenNumber);

        if (entry.getStatus() != QueueStatus.WAITING && entry.getStatus() != QueueStatus.CHECKED_IN) {
            throw new InvalidOperationException("Only waiting or checked-in tickets can be cancelled. Current status: " + entry.getStatus().getDisplayName());
        }

        entry.setStatus(QueueStatus.CANCELLED);
        entry.setServiceCompletedAt(LocalDateTime.now());

        QueueHistory history = new QueueHistory(entry, QueueStatus.CANCELLED, 0L);
        queueHistoryRepository.save(history);

        queueEntryRepository.save(entry);
        recalculateQueue(entry.getServiceType());

        return mapToResponse(entry);
    }

    public synchronized void recalculateQueue(ServiceType serviceType) {
        List<QueueEntry> waiting = queueEntryRepository.findByServiceTypeAndStatusIn(
                serviceType,
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN)
        );

        // Sort by priority value ASC, joinedAt ASC
        waiting.sort(getPriorityComparator());

        double avgServiceTime = getAverageServiceTime(serviceType);

        for (int i = 0; i < waiting.size(); i++) {
            QueueEntry q = waiting.get(i);
            int position = i + 1;
            int peopleAhead = i;
            int estimatedWait = (int) Math.round(peopleAhead * avgServiceTime);

            q.setQueuePosition(position);
            q.setEstimatedWaitMinutes(estimatedWait);
        }

        queueEntryRepository.saveAll(waiting);
    }

    public double getAverageServiceTime(ServiceType serviceType) {
        Double dbAvg = queueHistoryRepository.getAverageServiceDurationMinutesByService(serviceType);
        if (dbAvg != null && dbAvg > 0) {
            return Math.round(dbAvg * 10.0) / 10.0;
        }
        return serviceAverages.getOrDefault(serviceType, (double) defaultServiceTimeMinutes);
    }

    private void updateAverageServiceTime(ServiceType serviceType, long newDurationMinutes) {
        Double dbAvg = queueHistoryRepository.getAverageServiceDurationMinutesByService(serviceType);
        if (dbAvg != null && dbAvg > 0) {
            serviceAverages.put(serviceType, Math.round(dbAvg * 10.0) / 10.0);
        } else {
            double current = serviceAverages.getOrDefault(serviceType, (double) defaultServiceTimeMinutes);
            double updated = (current + newDurationMinutes) / 2.0;
            serviceAverages.put(serviceType, Math.round(updated * 10.0) / 10.0);
        }
    }

    private synchronized String generateNextToken(ServiceType serviceType) {
        AtomicInteger seq = sequenceGenerators.computeIfAbsent(serviceType, k -> new AtomicInteger(100));
        int next = seq.incrementAndGet();
        String prefix = serviceType.getCodePrefix().substring(0, 1);
        String candidate = prefix + "-" + next;

        // Ensure uniqueness
        while (queueEntryRepository.findByTokenNumber(candidate).isPresent()) {
            next = seq.incrementAndGet();
            candidate = prefix + "-" + next;
        }
        return candidate;
    }

    private Comparator<QueueEntry> getPriorityComparator() {
        return Comparator.comparing(QueueEntry::getPriority, Comparator.comparingInt(PriorityCategory::getValue))
                .thenComparing(QueueEntry::getJoinedAt);
    }

    private QueueEntry findEntryOrThrow(String tokenNumber) {
        return queueEntryRepository.findByTokenNumber(tokenNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No queue entry found for token: " + tokenNumber));
    }

    public QueueEntryResponse mapToResponse(QueueEntry entry) {
        QueueEntryResponse res = new QueueEntryResponse();
        res.setId(entry.getId());
        res.setTokenNumber(entry.getTokenNumber());
        res.setCustomerName(entry.getCustomer().getName());
        res.setPhoneNumber(entry.getCustomer().getPhoneNumber());
        res.setServiceType(entry.getServiceType());
        res.setServiceTypeName(entry.getServiceType().getDisplayName());
        res.setPriority(entry.getPriority());
        res.setPriorityName(entry.getPriority().getDisplayName());
        res.setPriorityValue(entry.getPriority().getValue());
        res.setStatus(entry.getStatus());
        res.setStatusName(entry.getStatus().getDisplayName());
        res.setJoinedAt(entry.getJoinedAt());
        res.setServiceStartedAt(entry.getServiceStartedAt());
        res.setServiceCompletedAt(entry.getServiceCompletedAt());
        res.setEstimatedWaitMinutes(entry.getEstimatedWaitMinutes());
        res.setQueuePosition(entry.getQueuePosition());

        int peopleAhead = (entry.getStatus() == QueueStatus.WAITING || entry.getStatus() == QueueStatus.CHECKED_IN)
                ? Math.max(0, entry.getQueuePosition() - 1) : 0;
        res.setPeopleAhead(peopleAhead);

        res.setCheckedIn(entry.isCheckedIn());
        res.setCheckedInAt(entry.getCheckedInAt());
        res.setQrCodeData(entry.getQrCodePath());

        // Warning rule: If customer has not checked in when turn is near (position <= 2), show warning
        boolean isNearTurn = (entry.getStatus() == QueueStatus.WAITING || entry.getStatus() == QueueStatus.CHECKED_IN)
                && entry.getQueuePosition() <= 2
                && !entry.isCheckedIn();
        res.setCheckInWarning(isNearTurn);

        if (entry.getAssignedCounter() != null) {
            res.setAssignedCounterName(entry.getAssignedCounter().getCounterName());
            res.setAssignedCounterId(entry.getAssignedCounter().getId());
        }

        Customer customer = entry.getCustomer();
        NoShowRisk risk = customerService.calculateNoShowRisk(customer);
        res.setNoShowRisk(risk);
        res.setNoShowReason(customerService.getNoShowReason(customer));
        res.setTotalPastNoShows(customer.getTotalNoShows());

        return res;
    }

    public void resetSequences() {
        for (ServiceType type : ServiceType.values()) {
            sequenceGenerators.put(type, new AtomicInteger(100));
        }
    }
}

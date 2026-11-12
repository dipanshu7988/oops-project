package com.smartqueue.service;

import com.smartqueue.dto.AdminDashboardResponse;
import com.smartqueue.dto.DailyStatisticsResponse;
import com.smartqueue.dto.QueueEntryResponse;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.entity.QueueHistory;
import com.smartqueue.model.entity.ServiceCounter;
import com.smartqueue.model.enums.NoShowRisk;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.QueueEntryRepository;
import com.smartqueue.repository.QueueHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class StatisticsService {

    private final QueueEntryRepository queueEntryRepository;
    private final QueueHistoryRepository queueHistoryRepository;
    private final CounterService counterService;
    private final QueueService queueService;
    private final CustomerService customerService;

    public StatisticsService(QueueEntryRepository queueEntryRepository,
                             QueueHistoryRepository queueHistoryRepository,
                             CounterService counterService,
                             QueueService queueService,
                             CustomerService customerService) {
        this.queueEntryRepository = queueEntryRepository;
        this.queueHistoryRepository = queueHistoryRepository;
        this.counterService = counterService;
        this.queueService = queueService;
        this.customerService = customerService;
    }

    public DailyStatisticsResponse getTodayStatistics() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<QueueHistory> histories = queueHistoryRepository.findByCompletedAtBetween(startOfDay, endOfDay);
        List<QueueEntry> todayEntries = queueEntryRepository.findByJoinedAtBetween(startOfDay, endOfDay);

        long served = histories.stream().filter(h -> h.getFinalStatus() == QueueStatus.SERVED).count();
        long noShows = histories.stream().filter(h -> h.getFinalStatus() == QueueStatus.NO_SHOW).count();
        long cancelled = histories.stream().filter(h -> h.getFinalStatus() == QueueStatus.CANCELLED).count();

        // Calculate average service time
        Double avgDb = queueHistoryRepository.getOverallAverageServiceDurationMinutes();
        double avgServiceTime = (avgDb != null && avgDb > 0) ? Math.round(avgDb * 10.0) / 10.0 : 3.0;

        // Busiest service type
        Map<ServiceType, Long> countsByService = todayEntries.stream()
                .collect(Collectors.groupingBy(QueueEntry::getServiceType, Collectors.counting()));
        String busiest = countsByService.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey().getDisplayName() + " (" + e.getValue() + " entries)")
                .orElse("None yet");

        // Peak hour
        Map<Integer, Long> hourCounts = todayEntries.stream()
                .collect(Collectors.groupingBy(e -> e.getJoinedAt().getHour(), Collectors.counting()));
        String peakHour = hourCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> String.format("%02d:00 - %02d:00 (%d visits)", e.getKey(), e.getKey() + 1, e.getValue()))
                .orElse("Not enough data");

        // Active waiting (WAITING or CHECKED_IN)
        List<QueueEntry> waiting = queueEntryRepository.findByStatusIn(
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN)
        );
        long activeWaiting = waiting.size();

        // High-risk customers currently waiting
        long highRiskCount = waiting.stream()
                .filter(q -> customerService.calculateNoShowRisk(q.getCustomer()) == NoShowRisk.HIGH)
                .count();

        DailyStatisticsResponse stats = new DailyStatisticsResponse();
        stats.setTotalCustomersServed(served);
        stats.setTotalNoShows(noShows);
        stats.setTotalCancelledEntries(cancelled);
        stats.setAverageServiceTimeMinutes(avgServiceTime);
        stats.setBusiestServiceType(busiest);
        stats.setPeakHour(peakHour);
        stats.setActiveCustomersWaiting(activeWaiting);
        stats.setHighRiskCustomersCount(highRiskCount);

        return stats;
    }

    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse dashboard = new AdminDashboardResponse();

        long waiting = queueEntryRepository.countByStatus(QueueStatus.WAITING)
                + queueEntryRepository.countByStatus(QueueStatus.CHECKED_IN);
        long serving = queueEntryRepository.countByStatus(QueueStatus.SERVING);
        dashboard.setTotalActiveWaiting(waiting);
        dashboard.setTotalServing(serving);

        Map<String, List<QueueEntryResponse>> queuesByService = new LinkedHashMap<>();
        Map<String, QueueEntryResponse> nextPerService = new LinkedHashMap<>();

        for (ServiceType serviceType : ServiceType.values()) {
            List<QueueEntryResponse> serviceQueue = queueService.getQueueByService(serviceType);
            queuesByService.put(serviceType.name(), serviceQueue);

            // The next person to serve is the first one in WAITING or CHECKED_IN status
            Optional<QueueEntryResponse> next = serviceQueue.stream()
                    .filter(e -> e.getStatus() == QueueStatus.WAITING || e.getStatus() == QueueStatus.CHECKED_IN)
                    .findFirst();
            next.ifPresent(entry -> nextPerService.put(serviceType.name(), entry));
        }

        dashboard.setQueuesByService(queuesByService);
        dashboard.setNextCustomerPerService(nextPerService);
        dashboard.setCounters(counterService.getAllCounters());
        dashboard.setStatistics(getTodayStatistics());

        return dashboard;
    }

    public void resetDay() {
        // Find all active queue entries (WAITING, CHECKED_IN, or SERVING)
        List<QueueEntry> activeEntries = queueEntryRepository.findByStatusIn(
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN, QueueStatus.SERVING)
        );

        LocalDateTime now = LocalDateTime.now();
        for (QueueEntry entry : activeEntries) {
            entry.setStatus(QueueStatus.CANCELLED);
            entry.setServiceCompletedAt(now);
            QueueHistory history = new QueueHistory(entry, QueueStatus.CANCELLED, 0L);
            queueHistoryRepository.save(history);
        }

        queueEntryRepository.saveAll(activeEntries);

        // Reset sequence generators for token numbers
        queueService.resetSequences();
    }
}

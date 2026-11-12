package com.smartqueue.service;

import com.smartqueue.dto.CheckInResponse;
import com.smartqueue.exception.InvalidOperationException;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.repository.QueueEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CheckInService {

    private final QueueEntryRepository queueEntryRepository;

    public CheckInService(QueueEntryRepository queueEntryRepository) {
        this.queueEntryRepository = queueEntryRepository;
    }

    public CheckInResponse checkInCustomer(String tokenNumber) {
        QueueEntry entry = queueEntryRepository.findByTokenNumber(tokenNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No ticket found with token: " + tokenNumber));

        // Rule: A customer can check in only once
        if (entry.isCheckedIn()) {
            throw new InvalidOperationException("Customer with token " + tokenNumber + " is already checked in.");
        }

        if (entry.getStatus() == QueueStatus.SERVED || entry.getStatus() == QueueStatus.CANCELLED || entry.getStatus() == QueueStatus.NO_SHOW) {
            throw new InvalidOperationException("Cannot check in ticket with terminal status: " + entry.getStatus().getDisplayName());
        }

        LocalDateTime now = LocalDateTime.now();
        entry.setCheckedIn(true);
        entry.setCheckedInAt(now);

        // Update status to CHECKED_IN if it was WAITING
        if (entry.getStatus() == QueueStatus.WAITING) {
            entry.setStatus(QueueStatus.CHECKED_IN);
        }

        // Note: Checked-in customer retains their original priority and position
        queueEntryRepository.save(entry);

        int peopleAhead = entry.getQueuePosition() > 0 ? entry.getQueuePosition() - 1 : 0;

        return new CheckInResponse(
                entry.getTokenNumber(),
                entry.getCustomer().getName(),
                entry.getServiceType(),
                entry.getServiceType().getDisplayName(),
                entry.isCheckedIn(),
                entry.getCheckedInAt(),
                entry.getQueuePosition(),
                peopleAhead,
                entry.getEstimatedWaitMinutes(),
                entry.getStatus()
        );
    }

    public List<CheckInResponse> getCheckInStatusList() {
        List<QueueEntry> active = queueEntryRepository.findByStatusIn(
                List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN, QueueStatus.SERVING)
        );

        return active.stream().map(entry -> {
            int peopleAhead = entry.getQueuePosition() > 0 ? entry.getQueuePosition() - 1 : 0;
            return new CheckInResponse(
                    entry.getTokenNumber(),
                    entry.getCustomer().getName(),
                    entry.getServiceType(),
                    entry.getServiceType().getDisplayName(),
                    entry.isCheckedIn(),
                    entry.getCheckedInAt(),
                    entry.getQueuePosition(),
                    peopleAhead,
                    entry.getEstimatedWaitMinutes(),
                    entry.getStatus()
            );
        }).toList();
    }
}

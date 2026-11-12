package com.smartqueue.repository;

import com.smartqueue.model.entity.QueueHistory;
import com.smartqueue.model.enums.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QueueHistoryRepository extends JpaRepository<QueueHistory, Long> {

    List<QueueHistory> findByCompletedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByFinalStatusAndCompletedAtBetween(QueueStatus status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT AVG(h.serviceDurationMinutes) FROM QueueHistory h WHERE h.finalStatus = 'SERVED' AND h.serviceDurationMinutes IS NOT NULL")
    Double getOverallAverageServiceDurationMinutes();

    @Query("SELECT AVG(h.serviceDurationMinutes) FROM QueueHistory h WHERE h.finalStatus = 'SERVED' AND h.queueEntry.serviceType = :serviceType AND h.serviceDurationMinutes IS NOT NULL")
    Double getAverageServiceDurationMinutesByService(com.smartqueue.model.enums.ServiceType serviceType);
}

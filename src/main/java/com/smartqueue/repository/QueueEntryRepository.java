package com.smartqueue.repository;

import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {

    Optional<QueueEntry> findByTokenNumber(String tokenNumber);

    boolean existsByCustomerAndServiceTypeAndStatusIn(
            Customer customer,
            ServiceType serviceType,
            Collection<QueueStatus> statuses
    );

    List<QueueEntry> findByServiceTypeAndStatus(ServiceType serviceType, QueueStatus status);

    List<QueueEntry> findByServiceTypeAndStatusIn(ServiceType serviceType, Collection<QueueStatus> statuses);

    List<QueueEntry> findByStatusIn(Collection<QueueStatus> statuses);

    List<QueueEntry> findByStatus(QueueStatus status);

    long countByStatus(QueueStatus status);

    long countByServiceType(ServiceType serviceType);

    List<QueueEntry> findByJoinedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT q FROM QueueEntry q WHERE q.serviceType = :serviceType AND q.status = 'WAITING' ORDER BY q.priority ASC, q.joinedAt ASC")
    List<QueueEntry> findWaitingQueueSorted(@Param("serviceType") ServiceType serviceType);

    @Query("SELECT q FROM QueueEntry q WHERE q.status = 'WAITING' ORDER BY q.priority ASC, q.joinedAt ASC")
    List<QueueEntry> findAllWaitingSorted();
}

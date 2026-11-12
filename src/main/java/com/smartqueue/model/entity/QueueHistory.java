package com.smartqueue.model.entity;

import com.smartqueue.model.enums.QueueStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_histories")
public class QueueHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "queue_entry_id", nullable = false)
    private QueueEntry queueEntry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QueueStatus finalStatus;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    private Long serviceDurationMinutes;

    public QueueHistory() {
        this.completedAt = LocalDateTime.now();
    }

    public QueueHistory(QueueEntry queueEntry, QueueStatus finalStatus, Long serviceDurationMinutes) {
        this.queueEntry = queueEntry;
        this.finalStatus = finalStatus;
        this.completedAt = LocalDateTime.now();
        this.serviceDurationMinutes = serviceDurationMinutes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QueueEntry getQueueEntry() {
        return queueEntry;
    }

    public void setQueueEntry(QueueEntry queueEntry) {
        this.queueEntry = queueEntry;
    }

    public QueueStatus getFinalStatus() {
        return finalStatus;
    }

    public void setFinalStatus(QueueStatus finalStatus) {
        this.finalStatus = finalStatus;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getServiceDurationMinutes() {
        return serviceDurationMinutes;
    }

    public void setServiceDurationMinutes(Long serviceDurationMinutes) {
        this.serviceDurationMinutes = serviceDurationMinutes;
    }
}

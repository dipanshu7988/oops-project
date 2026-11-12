package com.smartqueue.model.entity;

import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_entries", indexes = {
    @Index(name = "idx_token", columnList = "tokenNumber", unique = true),
    @Index(name = "idx_service_status", columnList = "serviceType, status")
})
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String tokenNumber;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PriorityCategory priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QueueStatus status = QueueStatus.WAITING;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    private LocalDateTime serviceStartedAt;

    private LocalDateTime serviceCompletedAt;

    private int estimatedWaitMinutes;

    private int queuePosition;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "counter_id")
    private ServiceCounter assignedCounter;

    @Column(nullable = false)
    private boolean checkedIn = false;

    private LocalDateTime checkedInAt;

    @Column(columnDefinition = "TEXT")
    private String qrCodePath;

    public QueueEntry() {
        this.joinedAt = LocalDateTime.now();
        this.status = QueueStatus.WAITING;
        this.checkedIn = false;
    }

    public QueueEntry(String tokenNumber, Customer customer, ServiceType serviceType, PriorityCategory priority) {
        this();
        this.tokenNumber = tokenNumber;
        this.customer = customer;
        this.serviceType = serviceType;
        this.priority = priority;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public PriorityCategory getPriority() {
        return priority;
    }

    public void setPriority(PriorityCategory priority) {
        this.priority = priority;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getServiceStartedAt() {
        return serviceStartedAt;
    }

    public void setServiceStartedAt(LocalDateTime serviceStartedAt) {
        this.serviceStartedAt = serviceStartedAt;
    }

    public LocalDateTime getServiceCompletedAt() {
        return serviceCompletedAt;
    }

    public void setServiceCompletedAt(LocalDateTime serviceCompletedAt) {
        this.serviceCompletedAt = serviceCompletedAt;
    }

    public int getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public int getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(int queuePosition) {
        this.queuePosition = queuePosition;
    }

    public ServiceCounter getAssignedCounter() {
        return assignedCounter;
    }

    public void setAssignedCounter(ServiceCounter assignedCounter) {
        this.assignedCounter = assignedCounter;
    }

    public boolean isCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(boolean checkedIn) {
        this.checkedIn = checkedIn;
    }

    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    public String getQrCodePath() {
        return qrCodePath;
    }

    public void setQrCodePath(String qrCodePath) {
        this.qrCodePath = qrCodePath;
    }
}

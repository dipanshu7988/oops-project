package com.smartqueue.dto;

import com.smartqueue.model.enums.NoShowRisk;
import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;

import java.time.LocalDateTime;

public class QueueEntryResponse {

    private Long id;
    private String tokenNumber;
    private String customerName;
    private String phoneNumber;
    private ServiceType serviceType;
    private String serviceTypeName;
    private PriorityCategory priority;
    private String priorityName;
    private int priorityValue;
    private QueueStatus status;
    private String statusName;
    private LocalDateTime joinedAt;
    private LocalDateTime serviceStartedAt;
    private LocalDateTime serviceCompletedAt;
    private int estimatedWaitMinutes;
    private int queuePosition;
    private int peopleAhead;
    private String assignedCounterName;
    private Long assignedCounterId;
    private NoShowRisk noShowRisk;
    private String noShowReason;
    private int totalPastNoShows;
    private boolean checkedIn;
    private LocalDateTime checkedInAt;
    private String qrCodeData;
    private boolean checkInWarning;

    public QueueEntryResponse() {
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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public String getServiceTypeName() {
        return serviceTypeName;
    }

    public void setServiceTypeName(String serviceTypeName) {
        this.serviceTypeName = serviceTypeName;
    }

    public PriorityCategory getPriority() {
        return priority;
    }

    public void setPriority(PriorityCategory priority) {
        this.priority = priority;
    }

    public String getPriorityName() {
        return priorityName;
    }

    public void setPriorityName(String priorityName) {
        this.priorityName = priorityName;
    }

    public int getPriorityValue() {
        return priorityValue;
    }

    public void setPriorityValue(int priorityValue) {
        this.priorityValue = priorityValue;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
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

    public int getPeopleAhead() {
        return peopleAhead;
    }

    public void setPeopleAhead(int peopleAhead) {
        this.peopleAhead = peopleAhead;
    }

    public String getAssignedCounterName() {
        return assignedCounterName;
    }

    public void setAssignedCounterName(String assignedCounterName) {
        this.assignedCounterName = assignedCounterName;
    }

    public Long getAssignedCounterId() {
        return assignedCounterId;
    }

    public void setAssignedCounterId(Long assignedCounterId) {
        this.assignedCounterId = assignedCounterId;
    }

    public NoShowRisk getNoShowRisk() {
        return noShowRisk;
    }

    public void setNoShowRisk(NoShowRisk noShowRisk) {
        this.noShowRisk = noShowRisk;
    }

    public String getNoShowReason() {
        return noShowReason;
    }

    public void setNoShowReason(String noShowReason) {
        this.noShowReason = noShowReason;
    }

    public int getTotalPastNoShows() {
        return totalPastNoShows;
    }

    public void setTotalPastNoShows(int totalPastNoShows) {
        this.totalPastNoShows = totalPastNoShows;
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

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public boolean isCheckInWarning() {
        return checkInWarning;
    }

    public void setCheckInWarning(boolean checkInWarning) {
        this.checkInWarning = checkInWarning;
    }
}

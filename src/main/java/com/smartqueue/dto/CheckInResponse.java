package com.smartqueue.dto;

import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;

import java.time.LocalDateTime;

public class CheckInResponse {

    private String tokenNumber;
    private String customerName;
    private ServiceType serviceType;
    private String serviceTypeName;
    private boolean checkedIn;
    private LocalDateTime checkedInAt;
    private int queuePosition;
    private int peopleAhead;
    private int estimatedWaitMinutes;
    private QueueStatus status;

    public CheckInResponse() {
    }

    public CheckInResponse(String tokenNumber, String customerName, ServiceType serviceType,
                           String serviceTypeName, boolean checkedIn, LocalDateTime checkedInAt,
                           int queuePosition, int peopleAhead, int estimatedWaitMinutes, QueueStatus status) {
        this.tokenNumber = tokenNumber;
        this.customerName = customerName;
        this.serviceType = serviceType;
        this.serviceTypeName = serviceTypeName;
        this.checkedIn = checkedIn;
        this.checkedInAt = checkedInAt;
        this.queuePosition = queuePosition;
        this.peopleAhead = peopleAhead;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.status = status;
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

    public int getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }
}

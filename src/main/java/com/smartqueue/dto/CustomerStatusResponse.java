package com.smartqueue.dto;

public class CustomerStatusResponse {

    private String tokenNumber;
    private String customerName;
    private int peopleAhead;
    private int estimatedWaitMinutes;
    private String queueType;
    private String priority;
    private String status;
    private String assignedCounter;
    private int queuePosition;

    public CustomerStatusResponse() {
    }

    public CustomerStatusResponse(String tokenNumber, String customerName, int peopleAhead,
                                  int estimatedWaitMinutes, String queueType, String priority,
                                  String status, String assignedCounter, int queuePosition) {
        this.tokenNumber = tokenNumber;
        this.customerName = customerName;
        this.peopleAhead = peopleAhead;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.queueType = queueType;
        this.priority = priority;
        this.status = status;
        this.assignedCounter = assignedCounter;
        this.queuePosition = queuePosition;
    }

    // Getters and Setters
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

    public String getQueueType() {
        return queueType;
    }

    public void setQueueType(String queueType) {
        this.queueType = queueType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedCounter() {
        return assignedCounter;
    }

    public void setAssignedCounter(String assignedCounter) {
        this.assignedCounter = assignedCounter;
    }

    public int getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(int queuePosition) {
        this.queuePosition = queuePosition;
    }
}

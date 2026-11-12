package com.smartqueue.dto;

import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class JoinQueueRequest {

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Name must be at least 2 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+]{10,15}$", message = "Phone number must be between 10 and 15 digits")
    private String phoneNumber;

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    @NotNull(message = "Priority category is required")
    private PriorityCategory priority;

    public JoinQueueRequest() {
    }

    public JoinQueueRequest(String name, String phoneNumber, ServiceType serviceType, PriorityCategory priority) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.serviceType = serviceType;
        this.priority = priority;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public PriorityCategory getPriority() {
        return priority;
    }

    public void setPriority(PriorityCategory priority) {
        this.priority = priority;
    }
}

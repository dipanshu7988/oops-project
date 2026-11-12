package com.smartqueue.dto;

import com.smartqueue.model.enums.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ServiceCounterRequest {

    @NotBlank(message = "Counter name is required")
    @Size(min = 2, max = 50, message = "Counter name must be between 2 and 50 characters")
    private String counterName;

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    private boolean active = true;

    public ServiceCounterRequest() {
    }

    public ServiceCounterRequest(String counterName, ServiceType serviceType, boolean active) {
        this.counterName = counterName;
        this.serviceType = serviceType;
        this.active = active;
    }

    public String getCounterName() {
        return counterName;
    }

    public void setCounterName(String counterName) {
        this.counterName = counterName;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

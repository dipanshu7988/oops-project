package com.smartqueue.model.entity;

import com.smartqueue.model.enums.ServiceType;
import jakarta.persistence.*;

@Entity
@Table(name = "service_counters")
public class ServiceCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String counterName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ServiceType serviceType;

    @Column(nullable = false)
    private boolean isActive = true;

    public ServiceCounter() {
    }

    public ServiceCounter(String counterName, ServiceType serviceType, boolean isActive) {
        this.counterName = counterName;
        this.serviceType = serviceType;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}

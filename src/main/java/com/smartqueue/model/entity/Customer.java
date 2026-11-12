package com.smartqueue.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20, unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private int totalVisits = 0;

    @Column(nullable = false)
    private int totalNoShows = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Customer() {
        this.createdAt = LocalDateTime.now();
    }

    public Customer(String name, String phoneNumber) {
        this();
        this.name = name;
        this.phoneNumber = phoneNumber;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public int getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(int totalVisits) {
        this.totalVisits = totalVisits;
    }

    public int getTotalNoShows() {
        return totalNoShows;
    }

    public void setTotalNoShows(int totalNoShows) {
        this.totalNoShows = totalNoShows;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void incrementVisits() {
        this.totalVisits++;
    }

    public void incrementNoShows() {
        this.totalNoShows++;
    }
}

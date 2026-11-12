package com.smartqueue.dto;

import com.smartqueue.model.enums.ServiceType;
import java.time.LocalDateTime;

public class FeedbackResponse {

    private Long id;
    private String tokenNumber;
    private ServiceType serviceType;
    private String serviceTypeName;
    private int rating;
    private String comment;
    private LocalDateTime submittedAt;

    public FeedbackResponse() {
    }

    public FeedbackResponse(Long id, String tokenNumber, ServiceType serviceType,
                            String serviceTypeName, int rating, String comment,
                            LocalDateTime submittedAt) {
        this.id = id;
        this.tokenNumber = tokenNumber;
        this.serviceType = serviceType;
        this.serviceTypeName = serviceTypeName;
        this.rating = rating;
        this.comment = comment;
        this.submittedAt = submittedAt;
    }

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

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}

package com.smartqueue.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks", indexes = {
    @Index(name = "idx_feedback_queue_entry", columnList = "queue_entry_id", unique = true)
})
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "queue_entry_id", nullable = false, unique = true)
    private QueueEntry queueEntry;

    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    @Column(nullable = false)
    private int rating;

    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    @Column(length = 500)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    public Feedback() {
        this.submittedAt = LocalDateTime.now();
    }

    public Feedback(QueueEntry queueEntry, int rating, String comment) {
        this();
        this.queueEntry = queueEntry;
        this.rating = rating;
        this.comment = comment != null ? comment.trim() : null;
    }

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
        this.comment = comment != null ? comment.trim() : null;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}

package com.smartqueue.service;

import com.smartqueue.dto.FeedbackRequest;
import com.smartqueue.dto.FeedbackResponse;
import com.smartqueue.dto.FeedbackStatisticsResponse;
import com.smartqueue.exception.DuplicateQueueException;
import com.smartqueue.exception.InvalidOperationException;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.model.entity.Feedback;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.repository.FeedbackRepository;
import com.smartqueue.repository.QueueEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final QueueEntryRepository queueEntryRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, QueueEntryRepository queueEntryRepository) {
        this.feedbackRepository = feedbackRepository;
        this.queueEntryRepository = queueEntryRepository;
    }

    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        String token = request.getTokenNumber().trim().toUpperCase();

        QueueEntry entry = queueEntryRepository.findByTokenNumber(token)
                .orElseThrow(() -> new ResourceNotFoundException("No ticket found with token: " + token));

        // Rule: Only customers with SERVED status can submit feedback
        if (entry.getStatus() != QueueStatus.SERVED) {
            throw new InvalidOperationException(
                    "Feedback can only be submitted after your service is completed (SERVED). Current ticket status: " + entry.getStatus().getDisplayName()
            );
        }

        // Rule: Each token can submit feedback only once
        if (feedbackRepository.existsByQueueEntryTokenNumber(token)) {
            throw new DuplicateQueueException("Feedback has already been submitted for token: " + token);
        }

        // Validate rating 1 to 5
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidOperationException("Rating must be between 1 and 5 stars.");
        }

        Feedback feedback = new Feedback(entry, request.getRating(), request.getComment());
        Feedback saved = feedbackRepository.save(feedback);

        return mapToResponse(saved);
    }

    public FeedbackResponse getFeedbackByToken(String tokenNumber) {
        String token = tokenNumber.trim().toUpperCase();
        Feedback feedback = feedbackRepository.findByQueueEntryTokenNumber(token)
                .orElseThrow(() -> new ResourceNotFoundException("No feedback found for token: " + token));
        return mapToResponse(feedback);
    }

    public FeedbackStatisticsResponse getFeedbackStatistics() {
        long total = feedbackRepository.count();
        Double avg = feedbackRepository.getAverageRating();
        double averageRating = (avg != null && total > 0) ? Math.round(avg * 10.0) / 10.0 : 0.0;

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            distribution.put(star, feedbackRepository.countByRating(star));
        }

        List<FeedbackResponse> recent = getRecentFeedback(5);

        return new FeedbackStatisticsResponse(averageRating, total, distribution, recent);
    }

    public List<FeedbackResponse> getRecentFeedback(int limit) {
        List<Feedback> list = feedbackRepository.findTop20ByOrderBySubmittedAtDesc();
        return list.stream()
                .limit(limit)
                .map(this::mapToResponse)
                .toList();
    }

    public FeedbackResponse mapToResponse(Feedback f) {
        return new FeedbackResponse(
                f.getId(),
                f.getQueueEntry().getTokenNumber(),
                f.getQueueEntry().getServiceType(),
                f.getQueueEntry().getServiceType().getDisplayName(),
                f.getRating(),
                f.getComment(),
                f.getSubmittedAt()
        );
    }
}

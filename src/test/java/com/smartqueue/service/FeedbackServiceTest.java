package com.smartqueue.service;

import com.smartqueue.dto.FeedbackRequest;
import com.smartqueue.dto.FeedbackResponse;
import com.smartqueue.dto.FeedbackStatisticsResponse;
import com.smartqueue.exception.DuplicateQueueException;
import com.smartqueue.exception.InvalidOperationException;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.Feedback;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.FeedbackRepository;
import com.smartqueue.repository.QueueEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private QueueEntryRepository queueEntryRepository;

    private FeedbackService feedbackService;

    @BeforeEach
    void setUp() {
        feedbackService = new FeedbackService(feedbackRepository, queueEntryRepository);
    }

    @Test
    @DisplayName("Should allow feedback submission for SERVED customers with 1-5 rating")
    void testSubmitFeedbackSuccess() {
        Customer customer = new Customer("Grace", "+1234567890");
        QueueEntry entry = new QueueEntry("F-101", customer, ServiceType.FOOD_ORDER, PriorityCategory.NORMAL);
        entry.setStatus(QueueStatus.SERVED);

        when(queueEntryRepository.findByTokenNumber("F-101")).thenReturn(Optional.of(entry));
        when(feedbackRepository.existsByQueueEntryTokenNumber("F-101")).thenReturn(false);

        Feedback saved = new Feedback(entry, 5, "Fast and delicious!");
        saved.setId(1L);
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(saved);

        FeedbackRequest req = new FeedbackRequest("F-101", 5, "Fast and delicious!");
        FeedbackResponse res = feedbackService.submitFeedback(req);

        assertNotNull(res);
        assertEquals("F-101", res.getTokenNumber());
        assertEquals(5, res.getRating());
        assertEquals("Fast and delicious!", res.getComment());

        verify(feedbackRepository, times(1)).save(any(Feedback.class));
    }

    @Test
    @DisplayName("Should reject feedback if customer status is WAITING or CANCELLED")
    void testRejectFeedbackForNonServedCustomers() {
        Customer customer = new Customer("Grace", "+1234567890");
        QueueEntry waitingEntry = new QueueEntry("F-102", customer, ServiceType.FOOD_ORDER, PriorityCategory.NORMAL);
        waitingEntry.setStatus(QueueStatus.WAITING);

        when(queueEntryRepository.findByTokenNumber("F-102")).thenReturn(Optional.of(waitingEntry));

        FeedbackRequest req = new FeedbackRequest("F-102", 4, "Too slow");

        assertThrows(InvalidOperationException.class, () -> feedbackService.submitFeedback(req));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject duplicate feedback for the same token number")
    void testRejectDuplicateFeedback() {
        Customer customer = new Customer("Grace", "+1234567890");
        QueueEntry entry = new QueueEntry("F-103", customer, ServiceType.FOOD_ORDER, PriorityCategory.NORMAL);
        entry.setStatus(QueueStatus.SERVED);

        when(queueEntryRepository.findByTokenNumber("F-103")).thenReturn(Optional.of(entry));
        when(feedbackRepository.existsByQueueEntryTokenNumber("F-103")).thenReturn(true);

        FeedbackRequest req = new FeedbackRequest("F-103", 5, "Second submission");

        assertThrows(DuplicateQueueException.class, () -> feedbackService.submitFeedback(req));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should validate rating is within 1 to 5 stars")
    void testRatingValidation() {
        Customer customer = new Customer("Grace", "+1234567890");
        QueueEntry entry = new QueueEntry("F-104", customer, ServiceType.FOOD_ORDER, PriorityCategory.NORMAL);
        entry.setStatus(QueueStatus.SERVED);

        when(queueEntryRepository.findByTokenNumber("F-104")).thenReturn(Optional.of(entry));
        when(feedbackRepository.existsByQueueEntryTokenNumber("F-104")).thenReturn(false);

        FeedbackRequest invalidLow = new FeedbackRequest("F-104", 0, "Zero star");
        assertThrows(InvalidOperationException.class, () -> feedbackService.submitFeedback(invalidLow));

        FeedbackRequest invalidHigh = new FeedbackRequest("F-104", 6, "Six star");
        assertThrows(InvalidOperationException.class, () -> feedbackService.submitFeedback(invalidHigh));
    }

    @Test
    @DisplayName("Should aggregate feedback statistics: average rating and star distribution")
    void testFeedbackStatistics() {
        when(feedbackRepository.count()).thenReturn(10L);
        when(feedbackRepository.getAverageRating()).thenReturn(4.4);
        when(feedbackRepository.countByRating(5)).thenReturn(6L);
        when(feedbackRepository.countByRating(4)).thenReturn(3L);
        when(feedbackRepository.countByRating(3)).thenReturn(1L);
        when(feedbackRepository.countByRating(2)).thenReturn(0L);
        when(feedbackRepository.countByRating(1)).thenReturn(0L);

        FeedbackStatisticsResponse stats = feedbackService.getFeedbackStatistics();

        assertEquals(4.4, stats.getAverageRating());
        assertEquals(10L, stats.getTotalFeedback());
        assertEquals(6L, stats.getRatingDistribution().get(5));
        assertEquals(3L, stats.getRatingDistribution().get(4));
        assertEquals(1L, stats.getRatingDistribution().get(3));
    }
}

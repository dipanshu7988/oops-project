package com.smartqueue.service;

import com.smartqueue.dto.DailyStatisticsResponse;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.entity.QueueHistory;
import com.smartqueue.model.enums.NoShowRisk;
import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.QueueEntryRepository;
import com.smartqueue.repository.QueueHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceTest {

    @Mock
    private QueueEntryRepository queueEntryRepository;

    @Mock
    private QueueHistoryRepository queueHistoryRepository;

    @Mock
    private CounterService counterService;

    @Mock
    private QueueService queueService;

    @Mock
    private CustomerService customerService;

    private StatisticsService statisticsService;

    @BeforeEach
    void setUp() {
        statisticsService = new StatisticsService(
                queueEntryRepository,
                queueHistoryRepository,
                counterService,
                queueService,
                customerService
        );
    }

    @Test
    @DisplayName("Should correctly aggregate daily statistics including served, no-shows, average time and high-risk count")
    void testDailyStatisticsCalculation() {
        Customer normalCust = new Customer("Normal", "+1112223331");
        Customer highRiskCust = new Customer("HighRisk", "+1112223332");
        highRiskCust.setTotalNoShows(3);

        QueueEntry e1 = new QueueEntry("D-101", normalCust, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);
        QueueEntry e2 = new QueueEntry("D-102", highRiskCust, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);

        QueueHistory h1 = new QueueHistory(e1, QueueStatus.SERVED, 4L);
        QueueHistory h2 = new QueueHistory(e1, QueueStatus.NO_SHOW, 0L);
        QueueHistory h3 = new QueueHistory(e1, QueueStatus.CANCELLED, 0L);

        when(queueHistoryRepository.findByCompletedAtBetween(any(), any())).thenReturn(List.of(h1, h2, h3));
        when(queueEntryRepository.findByJoinedAtBetween(any(), any())).thenReturn(List.of(e1, e2));
        when(queueHistoryRepository.getOverallAverageServiceDurationMinutes()).thenReturn(4.2);
        when(queueEntryRepository.findByStatusIn(any())).thenReturn(List.of(e1, e2));

        when(customerService.calculateNoShowRisk(normalCust)).thenReturn(NoShowRisk.LOW);
        when(customerService.calculateNoShowRisk(highRiskCust)).thenReturn(NoShowRisk.HIGH);

        DailyStatisticsResponse stats = statisticsService.getTodayStatistics();

        assertEquals(1, stats.getTotalCustomersServed());
        assertEquals(1, stats.getTotalNoShows());
        assertEquals(1, stats.getTotalCancelledEntries());
        assertEquals(4.2, stats.getAverageServiceTimeMinutes());
        assertEquals(2, stats.getActiveCustomersWaiting());
        assertEquals(1, stats.getHighRiskCustomersCount());
        assertTrue(stats.getBusiestServiceType().contains("Doctor Consultation"));
    }
}

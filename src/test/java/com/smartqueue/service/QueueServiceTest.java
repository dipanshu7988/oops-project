package com.smartqueue.service;

import com.smartqueue.dto.JoinQueueRequest;
import com.smartqueue.dto.QueueEntryResponse;
import com.smartqueue.exception.DuplicateQueueException;
import com.smartqueue.exception.InvalidOperationException;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.QueueEntry;
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
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QueueServiceTest {

    @Mock
    private QueueEntryRepository queueEntryRepository;

    @Mock
    private QueueHistoryRepository queueHistoryRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private CounterService counterService;

    @Mock
    private QrCodeService qrCodeService;

    private QueueService queueService;

    @BeforeEach
    void setUp() {
        queueService = new QueueService(
                queueEntryRepository,
                queueHistoryRepository,
                customerService,
                counterService,
                qrCodeService,
                3
        );
    }

    @Test
    @DisplayName("Should prevent customer from joining the same active service queue twice")
    void testDuplicateActiveTokenPrevention() {
        Customer customer = new Customer("Alice", "+1112223334");
        when(customerService.getOrCreateCustomer("Alice", "+1112223334")).thenReturn(customer);
        when(queueEntryRepository.existsByCustomerAndServiceTypeAndStatusIn(eq(customer), eq(ServiceType.DOCTOR_CONSULTATION), any()))
                .thenReturn(true);

        JoinQueueRequest req = new JoinQueueRequest("Alice", "+1112223334", ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);

        assertThrows(DuplicateQueueException.class, () -> queueService.joinQueue(req));
    }

    @Test
    @DisplayName("Should calculate queue positions and wait times based on priority and arrival time")
    void testPriorityOrderingAndWaitCalculation() {
        // Customer 1: Normal priority arrived at 10:00
        Customer c1 = new Customer("Bob Normal", "+1112223331");
        QueueEntry e1 = new QueueEntry("D-101", c1, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);
        e1.setJoinedAt(LocalDateTime.now().minusMinutes(20));

        // Customer 2: Emergency arrived later at 10:10
        Customer c2 = new Customer("Charlie Emergency", "+1112223332");
        QueueEntry e2 = new QueueEntry("D-102", c2, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.EMERGENCY);
        e2.setJoinedAt(LocalDateTime.now().minusMinutes(10));

        // Customer 3: VIP arrived at 10:15
        Customer c3 = new Customer("David VIP", "+1112223333");
        QueueEntry e3 = new QueueEntry("D-103", c3, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.VIP);
        e3.setJoinedAt(LocalDateTime.now().minusMinutes(5));

        // Waiting list returned from repository before recalculation
        List<QueueEntry> list = new ArrayList<>(List.of(e1, e2, e3));
        when(queueEntryRepository.findByServiceTypeAndStatusIn(eq(ServiceType.DOCTOR_CONSULTATION), any()))
                .thenReturn(list);
        when(queueHistoryRepository.getAverageServiceDurationMinutesByService(ServiceType.DOCTOR_CONSULTATION))
                .thenReturn(3.0);

        // Run recalculate
        queueService.recalculateQueue(ServiceType.DOCTOR_CONSULTATION);

        // Verification:
        // Position 1 must be EMERGENCY (e2)
        // Position 2 must be VIP (e3)
        // Position 3 must be NORMAL (e1)
        assertEquals(1, e2.getQueuePosition(), "Emergency customer should be 1st in line");
        assertEquals(0, e2.getEstimatedWaitMinutes(), "1st person has 0 wait");

        assertEquals(2, e3.getQueuePosition(), "VIP customer should be 2nd in line");
        assertEquals(3, e3.getEstimatedWaitMinutes(), "2nd person has 1 person ahead * 3 min = 3 min wait");

        assertEquals(3, e1.getQueuePosition(), "Normal customer should be 3rd in line");
        assertEquals(6, e1.getEstimatedWaitMinutes(), "3rd person has 2 people ahead * 3 min = 6 min wait");

        verify(queueEntryRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("Should enforce valid status transitions (only WAITING can be SERVING, only SERVING can be COMPLETED)")
    void testStatusTransitions() {
        Customer c = new Customer("Eve", "+1112223335");
        QueueEntry entry = new QueueEntry("F-101", c, ServiceType.FOOD_ORDER, PriorityCategory.NORMAL);
        entry.setStatus(QueueStatus.SERVED); // Already terminal

        when(queueEntryRepository.findByTokenNumber("F-101")).thenReturn(Optional.of(entry));

        // Trying to serve an already served customer should throw InvalidOperationException
        assertThrows(InvalidOperationException.class, () -> queueService.serveCustomer("F-101", null));

        // Trying to complete a WAITING customer directly should throw InvalidOperationException
        QueueEntry waitingEntry = new QueueEntry("F-102", c, ServiceType.FOOD_ORDER, PriorityCategory.NORMAL);
        waitingEntry.setStatus(QueueStatus.WAITING);
        when(queueEntryRepository.findByTokenNumber("F-102")).thenReturn(Optional.of(waitingEntry));

        assertThrows(InvalidOperationException.class, () -> queueService.completeCustomer("F-102"));
    }
}

package com.smartqueue.service;

import com.smartqueue.dto.DisplayBoardResponse;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.entity.ServiceCounter;
import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.QueueEntryRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisplayBoardServiceTest {

    @Mock
    private QueueEntryRepository queueEntryRepository;

    @Mock
    private QueueService queueService;

    private DisplayBoardService displayBoardService;

    @BeforeEach
    void setUp() {
        displayBoardService = new DisplayBoardService(queueEntryRepository, queueService);
    }

    @Test
    @DisplayName("Should return currently serving token and ordered next tokens for public display without leaking private data")
    void testDisplayBoardPrivacyAndOrdering() {
        // Serving entry
        Customer c1 = new Customer("Secret Name 1", "+19998887777");
        QueueEntry servingEntry = new QueueEntry("DC-100", c1, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);
        servingEntry.setStatus(QueueStatus.SERVING);
        ServiceCounter counter = new ServiceCounter("Room 101", ServiceType.DOCTOR_CONSULTATION, true);
        servingEntry.setAssignedCounter(counter);

        // Next waiting entries
        Customer c2 = new Customer("Secret Name 2", "+19998886666");
        QueueEntry next1 = new QueueEntry("DC-101", c2, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.EMERGENCY);
        next1.setJoinedAt(LocalDateTime.now().minusMinutes(5));

        Customer c3 = new Customer("Secret Name 3", "+19998885555");
        QueueEntry next2 = new QueueEntry("DC-102", c3, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);
        next2.setJoinedAt(LocalDateTime.now().minusMinutes(10));

        when(queueEntryRepository.findByServiceTypeAndStatus(ServiceType.DOCTOR_CONSULTATION, QueueStatus.SERVING))
                .thenReturn(List.of(servingEntry));
        when(queueEntryRepository.findByServiceTypeAndStatusIn(eq(ServiceType.DOCTOR_CONSULTATION), any()))
                .thenReturn(List.of(next2, next1)); // Unordered from db
        when(queueService.getAverageServiceTime(ServiceType.DOCTOR_CONSULTATION)).thenReturn(3.5);

        DisplayBoardResponse board = displayBoardService.getDisplayForService(ServiceType.DOCTOR_CONSULTATION);

        assertNotNull(board);
        assertNotNull(board.getCurrentlyServing());
        assertEquals("DC-100", board.getCurrentlyServing().getTokenNumber());
        assertEquals("Room 101", board.getCurrentlyServing().getCounterName());

        // Verify priority sorting on next tokens: Emergency DC-101 must precede Normal DC-102
        assertEquals(2, board.getNextTokens().size());
        assertEquals("DC-101", board.getNextTokens().get(0), "Emergency token must be 1st next token");
        assertEquals("DC-102", board.getNextTokens().get(1));

        // Privacy check: DisplayBoardResponse only contains strings of token numbers
        for (String token : board.getNextTokens()) {
            assertFalse(token.contains("Secret Name"), "Public display nextTokens must not contain customer names");
            assertFalse(token.contains("+1999"), "Public display must not contain phone numbers");
        }
    }
}

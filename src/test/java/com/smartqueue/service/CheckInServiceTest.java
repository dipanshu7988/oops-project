package com.smartqueue.service;

import com.smartqueue.dto.CheckInResponse;
import com.smartqueue.exception.InvalidOperationException;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.QueueEntry;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckInServiceTest {

    @Mock
    private QueueEntryRepository queueEntryRepository;

    private CheckInService checkInService;

    @BeforeEach
    void setUp() {
        checkInService = new CheckInService(queueEntryRepository);
    }

    @Test
    @DisplayName("Should successfully check in a waiting customer and update status to CHECKED_IN")
    void testCheckInSuccess() {
        Customer customer = new Customer("Bob", "+1234567890");
        QueueEntry entry = new QueueEntry("D-105", customer, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);
        entry.setStatus(QueueStatus.WAITING);
        entry.setCheckedIn(false);
        entry.setQueuePosition(3);

        when(queueEntryRepository.findByTokenNumber("D-105")).thenReturn(Optional.of(entry));
        when(queueEntryRepository.save(any(QueueEntry.class))).thenReturn(entry);

        CheckInResponse response = checkInService.checkInCustomer("D-105");

        assertTrue(response.isCheckedIn());
        assertNotNull(response.getCheckedInAt());
        assertEquals(QueueStatus.CHECKED_IN, response.getStatus());
        assertEquals("D-105", response.getTokenNumber());
        assertEquals(3, response.getQueuePosition(), "Check-in must preserve original queue position");

        verify(queueEntryRepository, times(1)).save(entry);
    }

    @Test
    @DisplayName("Should reject duplicate check-in for an already checked-in customer")
    void testPreventDuplicateCheckIn() {
        Customer customer = new Customer("Bob", "+1234567890");
        QueueEntry entry = new QueueEntry("D-105", customer, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);
        entry.setCheckedIn(true);
        entry.setStatus(QueueStatus.CHECKED_IN);

        when(queueEntryRepository.findByTokenNumber("D-105")).thenReturn(Optional.of(entry));

        assertThrows(InvalidOperationException.class, () -> checkInService.checkInCustomer("D-105"));
        verify(queueEntryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject check-in for a completed or cancelled ticket")
    void testRejectCheckInForTerminalStatus() {
        Customer customer = new Customer("Bob", "+1234567890");
        QueueEntry entry = new QueueEntry("D-105", customer, ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL);
        entry.setStatus(QueueStatus.SERVED);

        when(queueEntryRepository.findByTokenNumber("D-105")).thenReturn(Optional.of(entry));

        assertThrows(InvalidOperationException.class, () -> checkInService.checkInCustomer("D-105"));
    }
}

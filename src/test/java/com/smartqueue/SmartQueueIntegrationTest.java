package com.smartqueue;

import com.smartqueue.dto.CustomerStatusResponse;
import com.smartqueue.dto.JoinQueueRequest;
import com.smartqueue.dto.QueueEntryResponse;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.enums.NoShowRisk;
import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.CustomerRepository;
import com.smartqueue.service.CustomerService;
import com.smartqueue.service.QueueService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class SmartQueueIntegrationTest {

    @Autowired
    private QueueService queueService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private com.smartqueue.repository.QueueEntryRepository queueEntryRepository;

    @Autowired
    private com.smartqueue.repository.QueueHistoryRepository queueHistoryRepository;

    @Autowired
    private com.smartqueue.repository.FeedbackRepository feedbackRepository;

    @org.junit.jupiter.api.BeforeEach
    void cleanUp() {
        feedbackRepository.deleteAll();
        queueHistoryRepository.deleteAll();
        queueEntryRepository.deleteAll();
        queueService.resetSequences();
    }

    @Test
    @DisplayName("Comprehensive Integration Test: Priority ordering, serve flow, wait updates, and no-show risk elevation")
    void testFullQueueWorkflow() {
        // Step 1: Add multiple customers with different priorities
        JoinQueueRequest reqNormal = new JoinQueueRequest(
                "Normal Patient",
                "+9990001111",
                ServiceType.DOCTOR_CONSULTATION,
                PriorityCategory.NORMAL
        );
        QueueEntryResponse entryNormal = queueService.joinQueue(reqNormal);
        assertEquals(1, entryNormal.getQueuePosition());

        JoinQueueRequest reqElderly = new JoinQueueRequest(
                "Elderly Patient",
                "+9990002222",
                ServiceType.DOCTOR_CONSULTATION,
                PriorityCategory.ELDERLY
        );
        QueueEntryResponse entryElderly = queueService.joinQueue(reqElderly);

        JoinQueueRequest reqEmergency = new JoinQueueRequest(
                "Emergency Patient",
                "+9990003333",
                ServiceType.DOCTOR_CONSULTATION,
                PriorityCategory.EMERGENCY
        );
        QueueEntryResponse entryEmergency = queueService.joinQueue(reqEmergency);

        // Step 2: Confirms emergency customers move ahead of normal and elderly customers
        QueueEntryResponse currentEmergency = queueService.getQueueEntryByToken(entryEmergency.getTokenNumber());
        QueueEntryResponse currentElderly = queueService.getQueueEntryByToken(entryElderly.getTokenNumber());
        QueueEntryResponse currentNormal = queueService.getQueueEntryByToken(entryNormal.getTokenNumber());

        assertEquals(1, currentEmergency.getQueuePosition(), "Emergency customer must be at position 1");
        assertEquals(0, currentEmergency.getPeopleAhead(), "Emergency customer has 0 people ahead");

        assertEquals(2, currentElderly.getQueuePosition(), "Elderly customer must be at position 2");
        assertEquals(1, currentElderly.getPeopleAhead(), "Elderly customer has 1 person ahead");

        assertEquals(3, currentNormal.getQueuePosition(), "Normal customer must be bumped to position 3");
        assertEquals(2, currentNormal.getPeopleAhead(), "Normal customer has 2 people ahead");
        assertEquals(6, currentNormal.getEstimatedWaitMinutes(), "2 people ahead * 3 min = 6 min wait");

        // Step 3: Marks a customer as served
        // Serve emergency customer first
        queueService.serveCustomer(currentEmergency.getTokenNumber(), null);
        QueueEntryResponse servingEmergency = queueService.getQueueEntryByToken(currentEmergency.getTokenNumber());
        assertEquals(QueueStatus.SERVING, servingEmergency.getStatus());

        // Complete the service
        queueService.completeCustomer(currentEmergency.getTokenNumber());
        QueueEntryResponse completedEmergency = queueService.getQueueEntryByToken(currentEmergency.getTokenNumber());
        assertEquals(QueueStatus.SERVED, completedEmergency.getStatus());

        // Step 4: Confirms positions and wait times update correctly
        QueueEntryResponse updatedElderly = queueService.getQueueEntryByToken(entryElderly.getTokenNumber());
        QueueEntryResponse updatedNormal = queueService.getQueueEntryByToken(entryNormal.getTokenNumber());

        assertEquals(1, updatedElderly.getQueuePosition(), "Elderly customer is now 1st");
        assertEquals(0, updatedElderly.getPeopleAhead(), "Elderly has 0 people ahead");
        assertEquals(0, updatedElderly.getEstimatedWaitMinutes(), "Elderly has 0 wait");

        assertEquals(2, updatedNormal.getQueuePosition(), "Normal customer is now 2nd");
        assertEquals(1, updatedNormal.getPeopleAhead(), "Normal has 1 person ahead");
        int expectedWait = (int) Math.round(updatedNormal.getPeopleAhead() * queueService.getAverageServiceTime(ServiceType.DOCTOR_CONSULTATION));
        assertEquals(expectedWait, updatedNormal.getEstimatedWaitMinutes(), "Normal wait time must reflect updated rolling average service time");

        // Step 5: Mark a repeat customer as no-show
        // Create customer with 1 existing no-show
        Customer repeatCustomer = new Customer("Repeat Client", "+9990004444");
        repeatCustomer.setTotalNoShows(1);
        customerRepository.save(repeatCustomer);

        assertEquals(NoShowRisk.MEDIUM, customerService.calculateNoShowRisk(repeatCustomer));

        JoinQueueRequest reqRepeat = new JoinQueueRequest(
                "Repeat Client",
                "+9990004444",
                ServiceType.PAYMENT_COUNTER,
                PriorityCategory.NORMAL
        );
        QueueEntryResponse repeatToken = queueService.joinQueue(reqRepeat);

        // Mark this token as no-show
        queueService.markNoShow(repeatToken.getTokenNumber());

        // Step 6: Confirms their no-show risk increases
        Customer refreshed = customerRepository.findByPhoneNumber("+9990004444").orElseThrow();
        assertEquals(2, refreshed.getTotalNoShows(), "Total no-shows should have incremented from 1 to 2");

        NoShowRisk newRisk = customerService.calculateNoShowRisk(refreshed);
        assertEquals(NoShowRisk.HIGH, newRisk, "Customer no-show risk must escalate to HIGH");
        assertTrue(customerService.getNoShowReason(refreshed).contains("2 missed appointments"));
    }
}

package com.smartqueue.config;

import com.smartqueue.dto.JoinQueueRequest;
import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.entity.ServiceCounter;
import com.smartqueue.model.enums.PriorityCategory;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.CustomerRepository;
import com.smartqueue.repository.ServiceCounterRepository;
import com.smartqueue.service.QueueService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ServiceCounterRepository counterRepository;
    private final CustomerRepository customerRepository;
    private final QueueService queueService;

    public DataInitializer(ServiceCounterRepository counterRepository,
                           CustomerRepository customerRepository,
                           QueueService queueService) {
        this.counterRepository = counterRepository;
        this.customerRepository = customerRepository;
        this.queueService = queueService;
    }

    @Override
    public void run(String... args) {
        if (counterRepository.count() > 0) {
            return;
        }

        // Seed default counters
        counterRepository.save(new ServiceCounter("Counter 1 - Fast Food & Snacks", ServiceType.FOOD_ORDER, true));
        counterRepository.save(new ServiceCounter("Counter 2 - Meals & Beverages", ServiceType.FOOD_ORDER, true));
        counterRepository.save(new ServiceCounter("Room 101 - General Physician", ServiceType.DOCTOR_CONSULTATION, true));
        counterRepository.save(new ServiceCounter("Room 102 - Specialist Clinic", ServiceType.DOCTOR_CONSULTATION, true));
        counterRepository.save(new ServiceCounter("Desk A - Admissions & ID Verification", ServiceType.DOCUMENT_VERIFICATION, true));
        counterRepository.save(new ServiceCounter("Desk B - Academic Records & Stamp", ServiceType.DOCUMENT_VERIFICATION, true));
        counterRepository.save(new ServiceCounter("Window 1 - Tuition & Fee Cashier", ServiceType.PAYMENT_COUNTER, true));
        counterRepository.save(new ServiceCounter("Window 2 - Card & Digital Payments", ServiceType.PAYMENT_COUNTER, true));

        // Seed demo customers with historical no-show profiles
        Customer rahul = new Customer("Rahul Sharma", "+919876543210");
        rahul.setTotalVisits(5);
        rahul.setTotalNoShows(3); // HIGH RISK customer as specified in prompt example
        customerRepository.save(rahul);

        Customer ananya = new Customer("Ananya Patel", "+919876543211");
        ananya.setTotalVisits(2);
        ananya.setTotalNoShows(1); // MEDIUM RISK
        customerRepository.save(ananya);

        Customer vikram = new Customer("Vikram Singh", "+919876543212");
        vikram.setTotalVisits(4);
        vikram.setTotalNoShows(0); // LOW RISK
        customerRepository.save(vikram);

        // Seed sample queue tickets
        // 1. Normal customer arrives first in Doctor Consultation
        queueService.joinQueue(new JoinQueueRequest("Vikram Singh", "+919876543212", ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL));

        // 2. Elderly customer arrives in Doctor Consultation
        queueService.joinQueue(new JoinQueueRequest("Savita Devi (Senior)", "+919876543213", ServiceType.DOCTOR_CONSULTATION, PriorityCategory.ELDERLY));

        // 3. High-risk customer arrives in Doctor Consultation
        queueService.joinQueue(new JoinQueueRequest("Rahul Sharma", "+919876543210", ServiceType.DOCTOR_CONSULTATION, PriorityCategory.NORMAL));

        // 4. Food order customer
        queueService.joinQueue(new JoinQueueRequest("Amit Verma", "+919876543214", ServiceType.FOOD_ORDER, PriorityCategory.NORMAL));
        queueService.joinQueue(new JoinQueueRequest("Prof. Sen", "+919876543215", ServiceType.FOOD_ORDER, PriorityCategory.VIP));

        // 5. Document verification
        queueService.joinQueue(new JoinQueueRequest("Neha Gupta", "+919876543216", ServiceType.DOCUMENT_VERIFICATION, PriorityCategory.NORMAL));
    }
}

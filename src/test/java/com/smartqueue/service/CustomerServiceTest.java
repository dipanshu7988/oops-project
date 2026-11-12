package com.smartqueue.service;

import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.enums.NoShowRisk;
import com.smartqueue.repository.CustomerRepository;
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
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        customerService = new CustomerService(customerRepository);
    }

    @Test
    @DisplayName("Should evaluate LOW risk for customer with 0 past no-shows")
    void testLowNoShowRisk() {
        Customer customer = new Customer("John", "+1234567890");
        customer.setTotalNoShows(0);

        NoShowRisk risk = customerService.calculateNoShowRisk(customer);
        assertEquals(NoShowRisk.LOW, risk);
        assertEquals("No past no-shows", customerService.getNoShowReason(customer));
    }

    @Test
    @DisplayName("Should evaluate MEDIUM risk for customer with 1 past no-show")
    void testMediumNoShowRisk() {
        Customer customer = new Customer("Jane", "+1234567891");
        customer.setTotalNoShows(1);

        NoShowRisk risk = customerService.calculateNoShowRisk(customer);
        assertEquals(NoShowRisk.MEDIUM, risk);
        assertEquals("1 missed appointment in history", customerService.getNoShowReason(customer));
    }

    @Test
    @DisplayName("Should evaluate HIGH risk for customer with 2 or more past no-shows")
    void testHighNoShowRisk() {
        Customer customer = new Customer("Rahul", "+1234567892");
        customer.setTotalNoShows(3);

        NoShowRisk risk = customerService.calculateNoShowRisk(customer);
        assertEquals(NoShowRisk.HIGH, risk);
        assertEquals("3 missed appointments in history", customerService.getNoShowReason(customer));
    }

    @Test
    @DisplayName("Should increment customer no-shows and save")
    void testIncrementNoShows() {
        Customer customer = new Customer("Mark", "+1234567893");
        customer.setTotalNoShows(1);

        when(customerRepository.save(any(Customer.class))).thenReturn(customer);

        customerService.incrementCustomerNoShows(customer);

        assertEquals(2, customer.getTotalNoShows());
        verify(customerRepository, times(1)).save(customer);
    }
}

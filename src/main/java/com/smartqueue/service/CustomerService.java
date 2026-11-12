package com.smartqueue.service;

import com.smartqueue.model.entity.Customer;
import com.smartqueue.model.enums.NoShowRisk;
import com.smartqueue.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer getOrCreateCustomer(String name, String phoneNumber) {
        Optional<Customer> existing = customerRepository.findByPhoneNumber(phoneNumber);
        if (existing.isPresent()) {
            Customer customer = existing.get();
            // Update name if changed
            if (name != null && !name.trim().isEmpty() && !customer.getName().equals(name)) {
                customer.setName(name.trim());
                return customerRepository.save(customer);
            }
            return customer;
        }

        Customer newCustomer = new Customer(name.trim(), phoneNumber.trim());
        return customerRepository.save(newCustomer);
    }

    public Optional<Customer> findByPhoneNumber(String phoneNumber) {
        return customerRepository.findByPhoneNumber(phoneNumber);
    }

    public NoShowRisk calculateNoShowRisk(Customer customer) {
        if (customer == null) {
            return NoShowRisk.LOW;
        }
        return NoShowRisk.fromNoShowCount(customer.getTotalNoShows());
    }

    public String getNoShowReason(Customer customer) {
        if (customer == null || customer.getTotalNoShows() == 0) {
            return "No past no-shows";
        }
        if (customer.getTotalNoShows() == 1) {
            return "1 missed appointment in history";
        }
        return customer.getTotalNoShows() + " missed appointments in history";
    }

    public void incrementCustomerNoShows(Customer customer) {
        customer.incrementNoShows();
        customerRepository.save(customer);
    }

    public void incrementCustomerVisits(Customer customer) {
        customer.incrementVisits();
        customerRepository.save(customer);
    }
}

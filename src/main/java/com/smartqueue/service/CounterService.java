package com.smartqueue.service;

import com.smartqueue.dto.ServiceCounterRequest;
import com.smartqueue.exception.ResourceNotFoundException;
import com.smartqueue.model.entity.ServiceCounter;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.repository.ServiceCounterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CounterService {

    private final ServiceCounterRepository counterRepository;

    public CounterService(ServiceCounterRepository counterRepository) {
        this.counterRepository = counterRepository;
    }

    public List<ServiceCounter> getAllCounters() {
        return counterRepository.findAll();
    }

    public List<ServiceCounter> getActiveCountersByService(ServiceType serviceType) {
        return counterRepository.findByServiceTypeAndIsActiveTrue(serviceType);
    }

    public ServiceCounter getCounterById(Long id) {
        return counterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Counter not found with id: " + id));
    }

    public ServiceCounter createCounter(ServiceCounterRequest request) {
        ServiceCounter counter = new ServiceCounter(
                request.getCounterName().trim(),
                request.getServiceType(),
                request.isActive()
        );
        return counterRepository.save(counter);
    }

    public ServiceCounter updateCounter(Long id, ServiceCounterRequest request) {
        ServiceCounter counter = getCounterById(id);
        counter.setCounterName(request.getCounterName().trim());
        counter.setServiceType(request.getServiceType());
        counter.setActive(request.isActive());
        return counterRepository.save(counter);
    }

    public void deleteCounter(Long id) {
        ServiceCounter counter = getCounterById(id);
        counterRepository.delete(counter);
    }
}

package com.smartqueue.repository;

import com.smartqueue.model.entity.ServiceCounter;
import com.smartqueue.model.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCounterRepository extends JpaRepository<ServiceCounter, Long> {
    List<ServiceCounter> findByServiceType(ServiceType serviceType);
    List<ServiceCounter> findByServiceTypeAndIsActiveTrue(ServiceType serviceType);
    List<ServiceCounter> findByIsActiveTrue();
}

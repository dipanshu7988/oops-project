package com.smartqueue.controller;

import com.smartqueue.dto.ApiResponse;
import com.smartqueue.dto.CustomerStatusResponse;
import com.smartqueue.dto.JoinQueueRequest;
import com.smartqueue.dto.QueueEntryResponse;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueRestController {

    private final QueueService queueService;

    public QueueRestController(QueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> joinQueue(@Valid @RequestBody JoinQueueRequest request) {
        QueueEntryResponse response = queueService.joinQueue(request);
        return new ResponseEntity<>(
                ApiResponse.success("Token generated successfully! You have joined the queue.", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/token/{tokenNumber}")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> getQueueEntryByToken(@PathVariable String tokenNumber) {
        QueueEntryResponse response = queueService.getQueueEntryByToken(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Queue entry found", response));
    }

    @GetMapping("/token/{tokenNumber}/status")
    public ResponseEntity<ApiResponse<CustomerStatusResponse>> getCustomerStatus(@PathVariable String tokenNumber) {
        CustomerStatusResponse response = queueService.getCustomerStatus(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Customer status retrieved", response));
    }

    @GetMapping("/service/{serviceType}")
    public ResponseEntity<ApiResponse<List<QueueEntryResponse>>> getQueueByService(@PathVariable ServiceType serviceType) {
        List<QueueEntryResponse> entries = queueService.getQueueByService(serviceType);
        return ResponseEntity.ok(ApiResponse.success("Active entries for " + serviceType.getDisplayName(), entries));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<QueueEntryResponse>>> getAllActive() {
        List<QueueEntryResponse> entries = queueService.getAllActiveQueue();
        return ResponseEntity.ok(ApiResponse.success("All active entries retrieved", entries));
    }

    @PostMapping("/{tokenNumber}/serve")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> serveCustomer(
            @PathVariable String tokenNumber,
            @RequestParam(required = false) Long counterId) {
        QueueEntryResponse response = queueService.serveCustomer(tokenNumber, counterId);
        return ResponseEntity.ok(ApiResponse.success("Customer is now being served", response));
    }

    @PostMapping("/{tokenNumber}/complete")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> completeCustomer(@PathVariable String tokenNumber) {
        QueueEntryResponse response = queueService.completeCustomer(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Customer marked as completed/served", response));
    }

    @PostMapping("/{tokenNumber}/skip")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> skipCustomer(@PathVariable String tokenNumber) {
        QueueEntryResponse response = queueService.skipCustomer(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Customer ticket marked as skipped", response));
    }

    @PostMapping("/{tokenNumber}/no-show")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> markNoShow(@PathVariable String tokenNumber) {
        QueueEntryResponse response = queueService.markNoShow(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Customer marked as no-show", response));
    }

    @PostMapping("/{tokenNumber}/cancel")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> cancelCustomer(@PathVariable String tokenNumber) {
        QueueEntryResponse response = queueService.cancelCustomer(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Customer ticket cancelled", response));
    }
}

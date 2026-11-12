package com.smartqueue.controller;

import com.smartqueue.dto.AdminDashboardResponse;
import com.smartqueue.dto.ApiResponse;
import com.smartqueue.dto.DailyStatisticsResponse;
import com.smartqueue.dto.ServiceCounterRequest;
import com.smartqueue.model.entity.ServiceCounter;
import com.smartqueue.service.CounterService;
import com.smartqueue.service.StatisticsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminRestController {

    private final StatisticsService statisticsService;
    private final CounterService counterService;

    public AdminRestController(StatisticsService statisticsService, CounterService counterService) {
        this.statisticsService = statisticsService;
        this.counterService = counterService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse dashboard = statisticsService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard data retrieved", dashboard));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<DailyStatisticsResponse>> getStatistics() {
        DailyStatisticsResponse statistics = statisticsService.getTodayStatistics();
        return ResponseEntity.ok(ApiResponse.success("Daily statistics retrieved", statistics));
    }

    @PostMapping("/counters")
    public ResponseEntity<ApiResponse<ServiceCounter>> createCounter(@Valid @RequestBody ServiceCounterRequest request) {
        ServiceCounter counter = counterService.createCounter(request);
        return new ResponseEntity<>(ApiResponse.success("Counter created successfully", counter), HttpStatus.CREATED);
    }

    @PutMapping("/counters/{id}")
    public ResponseEntity<ApiResponse<ServiceCounter>> updateCounter(
            @PathVariable Long id,
            @Valid @RequestBody ServiceCounterRequest request) {
        ServiceCounter updated = counterService.updateCounter(id, request);
        return ResponseEntity.ok(ApiResponse.success("Counter updated successfully", updated));
    }

    @DeleteMapping("/counters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCounter(@PathVariable Long id) {
        counterService.deleteCounter(id);
        return ResponseEntity.ok(ApiResponse.success("Counter deleted successfully", null));
    }

    @PostMapping("/reset-day")
    public ResponseEntity<ApiResponse<String>> resetDay() {
        statisticsService.resetDay();
        return ResponseEntity.ok(ApiResponse.success("Queue has been safely reset for the new day", "Reset completed"));
    }
}

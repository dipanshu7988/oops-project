package com.smartqueue.dto;

import com.smartqueue.model.entity.ServiceCounter;
import java.util.List;
import java.util.Map;

public class AdminDashboardResponse {

    private long totalActiveWaiting;
    private long totalServing;
    private Map<String, List<QueueEntryResponse>> queuesByService;
    private Map<String, QueueEntryResponse> nextCustomerPerService;
    private List<ServiceCounter> counters;
    private DailyStatisticsResponse statistics;

    public AdminDashboardResponse() {
    }

    public long getTotalActiveWaiting() {
        return totalActiveWaiting;
    }

    public void setTotalActiveWaiting(long totalActiveWaiting) {
        this.totalActiveWaiting = totalActiveWaiting;
    }

    public long getTotalServing() {
        return totalServing;
    }

    public void setTotalServing(long totalServing) {
        this.totalServing = totalServing;
    }

    public Map<String, List<QueueEntryResponse>> getQueuesByService() {
        return queuesByService;
    }

    public void setQueuesByService(Map<String, List<QueueEntryResponse>> queuesByService) {
        this.queuesByService = queuesByService;
    }

    public Map<String, QueueEntryResponse> getNextCustomerPerService() {
        return nextCustomerPerService;
    }

    public void setNextCustomerPerService(Map<String, QueueEntryResponse> nextCustomerPerService) {
        this.nextCustomerPerService = nextCustomerPerService;
    }

    public List<ServiceCounter> getCounters() {
        return counters;
    }

    public void setCounters(List<ServiceCounter> counters) {
        this.counters = counters;
    }

    public DailyStatisticsResponse getStatistics() {
        return statistics;
    }

    public void setStatistics(DailyStatisticsResponse statistics) {
        this.statistics = statistics;
    }
}

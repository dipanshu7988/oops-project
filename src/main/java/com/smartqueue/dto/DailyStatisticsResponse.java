package com.smartqueue.dto;

public class DailyStatisticsResponse {

    private long totalCustomersServed;
    private long totalNoShows;
    private long totalCancelledEntries;
    private double averageServiceTimeMinutes;
    private String busiestServiceType;
    private String peakHour;
    private long activeCustomersWaiting;
    private long highRiskCustomersCount;

    public DailyStatisticsResponse() {
    }

    public long getTotalCustomersServed() {
        return totalCustomersServed;
    }

    public void setTotalCustomersServed(long totalCustomersServed) {
        this.totalCustomersServed = totalCustomersServed;
    }

    public long getTotalNoShows() {
        return totalNoShows;
    }

    public void setTotalNoShows(long totalNoShows) {
        this.totalNoShows = totalNoShows;
    }

    public long getTotalCancelledEntries() {
        return totalCancelledEntries;
    }

    public void setTotalCancelledEntries(long totalCancelledEntries) {
        this.totalCancelledEntries = totalCancelledEntries;
    }

    public double getAverageServiceTimeMinutes() {
        return averageServiceTimeMinutes;
    }

    public void setAverageServiceTimeMinutes(double averageServiceTimeMinutes) {
        this.averageServiceTimeMinutes = averageServiceTimeMinutes;
    }

    public String getBusiestServiceType() {
        return busiestServiceType;
    }

    public void setBusiestServiceType(String busiestServiceType) {
        this.busiestServiceType = busiestServiceType;
    }

    public String getPeakHour() {
        return peakHour;
    }

    public void setPeakHour(String peakHour) {
        this.peakHour = peakHour;
    }

    public long getActiveCustomersWaiting() {
        return activeCustomersWaiting;
    }

    public void setActiveCustomersWaiting(long activeCustomersWaiting) {
        this.activeCustomersWaiting = activeCustomersWaiting;
    }

    public long getHighRiskCustomersCount() {
        return highRiskCustomersCount;
    }

    public void setHighRiskCustomersCount(long highRiskCustomersCount) {
        this.highRiskCustomersCount = highRiskCustomersCount;
    }
}

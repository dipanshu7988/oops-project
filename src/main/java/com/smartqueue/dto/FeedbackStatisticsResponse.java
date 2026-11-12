package com.smartqueue.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FeedbackStatisticsResponse {

    private double averageRating;
    private long totalFeedback;
    private Map<Integer, Long> ratingDistribution = new HashMap<>();
    private List<FeedbackResponse> recentFeedback;

    public FeedbackStatisticsResponse() {
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
        }
    }

    public FeedbackStatisticsResponse(double averageRating, long totalFeedback,
                                      Map<Integer, Long> ratingDistribution,
                                      List<FeedbackResponse> recentFeedback) {
        this.averageRating = averageRating;
        this.totalFeedback = totalFeedback;
        this.ratingDistribution = ratingDistribution;
        this.recentFeedback = recentFeedback;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public Map<Integer, Long> getRatingDistribution() {
        return ratingDistribution;
    }

    public void setRatingDistribution(Map<Integer, Long> ratingDistribution) {
        this.ratingDistribution = ratingDistribution;
    }

    public List<FeedbackResponse> getRecentFeedback() {
        return recentFeedback;
    }

    public void setRecentFeedback(List<FeedbackResponse> recentFeedback) {
        this.recentFeedback = recentFeedback;
    }
}

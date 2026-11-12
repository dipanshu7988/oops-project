package com.smartqueue.model.enums;

public enum NoShowRisk {
    LOW("Low", "No past no-shows"),
    MEDIUM("Medium", "1 missed appointment in history"),
    HIGH("High", "2 or more missed appointments in history");

    private final String label;
    private final String reason;

    NoShowRisk(String label, String reason) {
        this.label = label;
        this.reason = reason;
    }

    public String getLabel() {
        return label;
    }

    public String getReason() {
        return reason;
    }

    public static NoShowRisk fromNoShowCount(int noShowCount) {
        if (noShowCount >= 2) {
            return HIGH;
        } else if (noShowCount == 1) {
            return MEDIUM;
        } else {
            return LOW;
        }
    }
}

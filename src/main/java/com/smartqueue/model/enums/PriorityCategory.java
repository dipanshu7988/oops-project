package com.smartqueue.model.enums;

public enum PriorityCategory {
    EMERGENCY(1, "Emergency", "Served first"),
    VIP(2, "VIP", "Served after emergencies"),
    ELDERLY(3, "Elderly", "Served after VIP"),
    NORMAL(4, "Normal", "Standard queue");

    private final int value;
    private final String displayName;
    private final String description;

    PriorityCategory(int value, String displayName, String description) {
        this.value = value;
        this.displayName = displayName;
        this.description = description;
    }

    public int getValue() {
        return value;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}

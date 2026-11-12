package com.smartqueue.model.enums;

public enum QueueStatus {
    WAITING("Waiting"),
    CHECKED_IN("Checked In"),
    SERVING("Serving"),
    SERVED("Served"),
    SKIPPED("Skipped"),
    NO_SHOW("No-Show"),
    CANCELLED("Cancelled");

    private final String displayName;

    QueueStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isActive() {
        return this == WAITING || this == CHECKED_IN || this == SERVING;
    }

    public boolean isWaitingOrCheckedIn() {
        return this == WAITING || this == CHECKED_IN;
    }

    public boolean isTerminal() {
        return this == SERVED || this == SKIPPED || this == NO_SHOW || this == CANCELLED;
    }
}

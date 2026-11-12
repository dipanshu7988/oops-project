package com.smartqueue.model.enums;

public enum ServiceType {
    FOOD_ORDER("Food Order", "FO"),
    DOCTOR_CONSULTATION("Doctor Consultation", "DC"),
    DOCUMENT_VERIFICATION("Document Verification", "DV"),
    PAYMENT_COUNTER("Payment Counter", "PC");

    private final String displayName;
    private final String codePrefix;

    ServiceType(String displayName, String codePrefix) {
        this.displayName = displayName;
        this.codePrefix = codePrefix;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCodePrefix() {
        return codePrefix;
    }
}

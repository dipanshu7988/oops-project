package com.smartqueue.service;

import com.smartqueue.model.enums.ServiceType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class QrCodeServiceTest {

    private QrCodeService qrCodeService;

    @BeforeEach
    void setUp() {
        qrCodeService = new QrCodeService();
    }

    @Test
    @DisplayName("Should generate valid QR Code PNG bytes with standard PNG magic header")
    void testQrCodeGeneration() {
        byte[] png = qrCodeService.generateQrCodePng(
                "A-101",
                "John Doe",
                ServiceType.DOCTOR_CONSULTATION,
                LocalDateTime.now(),
                200,
                200
        );

        assertNotNull(png);
        assertTrue(png.length > 50, "Generated PNG must contain image bytes");

        // Verify standard PNG magic header bytes: 0x89 'P' 'N' 'G'
        assertEquals((byte) 0x89, png[0]);
        assertEquals((byte) 'P', png[1]);
        assertEquals((byte) 'N', png[2]);
        assertEquals((byte) 'G', png[3]);
    }

    @Test
    @DisplayName("QR payload must contain token, service, and timestamp without sensitive customer phone numbers")
    void testQrPayloadPrivacy() {
        LocalDateTime time = LocalDateTime.of(2026, 11, 12, 10, 30, 0);
        String payload = qrCodeService.createPayloadJson(
                "D-101",
                "Alice",
                ServiceType.DOCTOR_CONSULTATION,
                time
        );

        assertTrue(payload.contains("D-101"), "Payload must contain tokenNumber");
        assertTrue(payload.contains("DOCTOR_CONSULTATION"), "Payload must contain serviceType");
        assertTrue(payload.contains("2026-11-12T10:30:00"), "Payload must contain joinedAt");
        assertFalse(payload.contains("phone"), "Payload must not expose phone number field");
        assertFalse(payload.contains("password"), "Payload must not expose sensitive keys");
    }
}

package com.smartqueue.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.smartqueue.model.enums.ServiceType;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QrCodeService {

    private static final int DEFAULT_WIDTH = 300;
    private static final int DEFAULT_HEIGHT = 300;

    public String createPayloadJson(String tokenNumber, String customerName, ServiceType serviceType, LocalDateTime joinedAt) {
        // Privacy rule: No phone numbers, passwords, or sensitive details
        String joinedStr = joinedAt != null ? joinedAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "";
        String safeName = customerName != null ? customerName.replace("\"", "\\\"") : "";

        return String.format(
                "{\"tokenNumber\":\"%s\",\"customerName\":\"%s\",\"serviceType\":\"%s\",\"joinedAt\":\"%s\"}",
                tokenNumber, safeName, serviceType.name(), joinedStr
        );
    }

    public byte[] generateQrCodePng(String tokenNumber, String customerName, ServiceType serviceType, LocalDateTime joinedAt, int width, int height) {
        String payload = createPayloadJson(tokenNumber, customerName, serviceType, joinedAt);
        return generatePngBytes(payload, width, height);
    }

    public byte[] generatePngBytes(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code image: " + e.getMessage(), e);
        }
    }

    public String generateQrCodeBase64(String tokenNumber, String customerName, ServiceType serviceType, LocalDateTime joinedAt) {
        byte[] png = generateQrCodePng(tokenNumber, customerName, serviceType, joinedAt, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(png);
    }
}

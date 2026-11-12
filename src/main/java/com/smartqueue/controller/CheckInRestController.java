package com.smartqueue.controller;

import com.smartqueue.dto.ApiResponse;
import com.smartqueue.dto.CheckInResponse;
import com.smartqueue.dto.QueueEntryResponse;
import com.smartqueue.service.CheckInService;
import com.smartqueue.service.QrCodeService;
import com.smartqueue.service.QueueService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CheckInRestController {

    private final CheckInService checkInService;
    private final QueueService queueService;
    private final QrCodeService qrCodeService;

    public CheckInRestController(CheckInService checkInService,
                                 QueueService queueService,
                                 QrCodeService qrCodeService) {
        this.checkInService = checkInService;
        this.queueService = queueService;
        this.qrCodeService = qrCodeService;
    }

    @GetMapping(value = "/queue/{tokenNumber}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrCodePng(@PathVariable String tokenNumber) {
        QueueEntryResponse entry = queueService.getQueueEntryByToken(tokenNumber);
        byte[] pngBytes = qrCodeService.generateQrCodePng(
                entry.getTokenNumber(),
                entry.getCustomerName(),
                entry.getServiceType(),
                entry.getJoinedAt(),
                300,
                300
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDispositionFormData("attachment", "token-" + tokenNumber + "-qr.png");

        return new ResponseEntity<>(pngBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/queue/{tokenNumber}/check-in")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn(@PathVariable String tokenNumber) {
        CheckInResponse response = checkInService.checkInCustomer(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Customer checked in successfully! Priority position preserved.", response));
    }

    @GetMapping("/admin/check-in-status")
    public ResponseEntity<ApiResponse<List<CheckInResponse>>> getCheckInStatus() {
        List<CheckInResponse> statusList = checkInService.getCheckInStatusList();
        return ResponseEntity.ok(ApiResponse.success("Check-in status of active tickets retrieved", statusList));
    }
}

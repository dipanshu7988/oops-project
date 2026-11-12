package com.smartqueue.controller;

import com.smartqueue.dto.ApiResponse;
import com.smartqueue.dto.DisplayBoardResponse;
import com.smartqueue.model.enums.ServiceType;
import com.smartqueue.service.DisplayBoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/display")
@CrossOrigin(origins = "*")
public class DisplayRestController {

    private final DisplayBoardService displayBoardService;

    public DisplayRestController(DisplayBoardService displayBoardService) {
        this.displayBoardService = displayBoardService;
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<List<DisplayBoardResponse.CurrentlyServingDto>>> getCurrentServing() {
        List<DisplayBoardResponse.CurrentlyServingDto> serving = displayBoardService.getCurrentServingAll();
        return ResponseEntity.ok(ApiResponse.success("Currently serving tokens retrieved", serving));
    }

    @GetMapping("/next")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getNextTokens() {
        Map<String, List<String>> nextTokens = displayBoardService.getNextTokensAll();
        return ResponseEntity.ok(ApiResponse.success("Next waiting tokens retrieved", nextTokens));
    }

    @GetMapping("/service/{serviceType}")
    public ResponseEntity<ApiResponse<DisplayBoardResponse>> getDisplayByService(@PathVariable ServiceType serviceType) {
        DisplayBoardResponse response = displayBoardService.getDisplayForService(serviceType);
        return ResponseEntity.ok(ApiResponse.success("Live display data for " + serviceType.getDisplayName(), response));
    }
}

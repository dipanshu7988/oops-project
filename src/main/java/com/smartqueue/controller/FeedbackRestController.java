package com.smartqueue.controller;

import com.smartqueue.dto.ApiResponse;
import com.smartqueue.dto.FeedbackRequest;
import com.smartqueue.dto.FeedbackResponse;
import com.smartqueue.dto.FeedbackStatisticsResponse;
import com.smartqueue.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FeedbackRestController {

    private final FeedbackService feedbackService;

    public FeedbackRestController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        FeedbackResponse response = feedbackService.submitFeedback(request);
        return new ResponseEntity<>(
                ApiResponse.success("Thank you for your valuable feedback!", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/feedback/{tokenNumber}")
    public ResponseEntity<ApiResponse<FeedbackResponse>> getFeedback(@PathVariable String tokenNumber) {
        FeedbackResponse response = feedbackService.getFeedbackByToken(tokenNumber);
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved", response));
    }

    @GetMapping("/admin/feedback/statistics")
    public ResponseEntity<ApiResponse<FeedbackStatisticsResponse>> getFeedbackStatistics() {
        FeedbackStatisticsResponse stats = feedbackService.getFeedbackStatistics();
        return ResponseEntity.ok(ApiResponse.success("Feedback statistics retrieved", stats));
    }

    @GetMapping("/admin/feedback/recent")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getRecentFeedback(
            @RequestParam(defaultValue = "10") int limit) {
        List<FeedbackResponse> recent = feedbackService.getRecentFeedback(limit);
        return ResponseEntity.ok(ApiResponse.success("Recent customer feedback retrieved", recent));
    }
}

package com.sachin.portfolio.controller;

import com.sachin.portfolio.service.VisitorService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Visitor Controller
 * POST /api/visit        — public, called by portfolio on page load
 * GET  /api/admin/visitors — protected, returns analytics for dashboard
 */
@RestController
@RequiredArgsConstructor
@CrossOrigin
public class VisitorController {

    private final VisitorService visitorService;

    /** Track a visit — called automatically when portfolio page loads */
    @PostMapping("/api/visit")
    public ResponseEntity<Map<String, String>> trackVisit(
            HttpServletRequest request,
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false, defaultValue = "/") String page) {

        visitorService.trackVisit(request, sessionId, page);
        return ResponseEntity.ok(Map.of("status", "tracked"));
    }

    /** Public endpoint — returns simple total count for portfolio display */
    @GetMapping("/api/visit/count")
    public ResponseEntity<Map<String, Long>> getVisitorCount() {
        return ResponseEntity.ok(Map.of(
                "total",  visitorService.getTotalVisitors(),
                "today",  visitorService.getTodayVisitors(),
                "unique", visitorService.getUniqueVisitors()
        ));
    }

    /** Admin endpoint — full analytics */
    @GetMapping("/api/admin/visitors")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(visitorService.getAnalytics());
    }
}

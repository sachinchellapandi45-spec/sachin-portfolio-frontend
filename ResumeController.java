package com.sachin.portfolio.controller;

import com.sachin.portfolio.service.ResumeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    /** POST /api/resume/download - Track resume download (public) */
    @PostMapping("/api/resume/download")
    public ResponseEntity<Map<String, String>> trackDownload(HttpServletRequest request) {
        resumeService.recordDownload(request);
        return ResponseEntity.ok(Map.of("status", "tracked"));
    }

    /** GET /api/admin/resume/stats - Resume download stats (JWT required) */
    @GetMapping("/api/admin/resume/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(resumeService.getStats());
    }
}

package com.sachin.portfolio.service;

import com.sachin.portfolio.model.ResumeDownload;
import com.sachin.portfolio.repository.ResumeDownloadRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeDownloadRepository resumeDownloadRepository;

    @Transactional
    public ResumeDownload recordDownload(HttpServletRequest request) {
        String ip = request != null ? request.getRemoteAddr() : "unknown";
        String ua = request != null ? request.getHeader("User-Agent") : null;

        ResumeDownload download = ResumeDownload.builder()
                .ipAddress(ip)
                .userAgent(ua)
                .build();
        return resumeDownloadRepository.save(download);
    }

    public Map<String, Object> getStats() {
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", resumeDownloadRepository.count());
        stats.put("today", resumeDownloadRepository.countByDownloadedAtAfter(todayStart));
        stats.put("week", resumeDownloadRepository.countByDownloadedAtAfter(weekStart));
        stats.put("month", resumeDownloadRepository.countByDownloadedAtAfter(monthStart));
        stats.put("recentDownloads", resumeDownloadRepository.findAll());
        return stats;
    }
}

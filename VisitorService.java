package com.sachin.portfolio.service;

import com.sachin.portfolio.model.Visitor;
import com.sachin.portfolio.repository.VisitorRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VisitorService {

    private final VisitorRepository visitorRepository;

    /**
     * Track a new portfolio visit.
     * Parses User-Agent to detect device type and browser.
     */
    @Transactional
    public void trackVisit(HttpServletRequest request, String sessionId, String page) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String referer  = request.getHeader("Referer");

        String deviceType = detectDevice(userAgent);
        String browser    = detectBrowser(userAgent);
        String os         = detectOs(userAgent);

        Visitor visitor = Visitor.builder()
                .ipAddress(ip)
                .sessionId(sessionId)
                .pageVisited(page != null ? page : "/")
                .userAgent(userAgent)
                .referer(referer)
                .deviceType(deviceType)
                .browser(browser)
                .os(os)
                .build();

        visitorRepository.save(visitor);
    }

    // ── Analytics ──────────────────────────────────────────────────────────

    public long getTotalVisitors()  { return visitorRepository.count(); }

    public long getUniqueVisitors() { return visitorRepository.countDistinctIpAddresses(); }

    public long getTodayVisitors() {
        return visitorRepository.countByVisitedAtAfter(LocalDateTime.now().toLocalDate().atStartOfDay());
    }

    public long getWeekVisitors() {
        return visitorRepository.countByVisitedAtAfter(LocalDateTime.now().minusDays(7));
    }

    public long getMonthVisitors() {
        return visitorRepository.countByVisitedAtAfter(LocalDateTime.now().minusDays(30));
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalVisitors",  getTotalVisitors());
        analytics.put("uniqueVisitors", getUniqueVisitors());
        analytics.put("todayVisitors",  getTodayVisitors());
        analytics.put("weekVisitors",   getWeekVisitors());
        analytics.put("monthVisitors",  getMonthVisitors());
        analytics.put("dailyStats",     visitorRepository.getDailyStats(LocalDateTime.now().minusDays(30)));
        analytics.put("deviceStats",    visitorRepository.getDeviceStats());
        analytics.put("browserStats",   visitorRepository.getBrowserStats());
        analytics.put("recentVisitors", visitorRepository.findTop20ByOrderByVisitedAtDesc());
        return analytics;
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) return request.getRemoteAddr();
        return xfHeader.split(",")[0].trim();
    }

    private String detectDevice(String ua) {
        if (ua == null) return "Unknown";
        String u = ua.toLowerCase();
        if (u.contains("mobile") || u.contains("android") || u.contains("iphone")) return "Mobile";
        if (u.contains("tablet") || u.contains("ipad")) return "Tablet";
        return "Desktop";
    }

    private String detectBrowser(String ua) {
        if (ua == null) return "Unknown";
        String u = ua.toLowerCase();
        if (u.contains("edg/"))    return "Edge";
        if (u.contains("opr/") || u.contains("opera")) return "Opera";
        if (u.contains("chrome"))  return "Chrome";
        if (u.contains("firefox")) return "Firefox";
        if (u.contains("safari") && !u.contains("chrome")) return "Safari";
        if (u.contains("msie") || u.contains("trident")) return "IE";
        return "Other";
    }

    private String detectOs(String ua) {
        if (ua == null) return "Unknown";
        String u = ua.toLowerCase();
        if (u.contains("windows")) return "Windows";
        if (u.contains("mac os"))  return "macOS";
        if (u.contains("android")) return "Android";
        if (u.contains("iphone") || u.contains("ipad")) return "iOS";
        if (u.contains("linux"))   return "Linux";
        return "Other";
    }
}

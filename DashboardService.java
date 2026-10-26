package com.sachin.portfolio.service;

import com.sachin.portfolio.dto.DashboardStatsDto;
import com.sachin.portfolio.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Aggregates all dashboard statistics.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContactMessageRepository contactMessageRepository;
    private final ProjectRepository        projectRepository;
    private final SkillRepository          skillRepository;
    private final ResumeDownloadRepository resumeDownloadRepository;
    private final VisitorRepository        visitorRepository;

    public DashboardStatsDto getStats() {
        LocalDateTime todayStart  = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime weekStart   = LocalDateTime.now().minusDays(7);
        LocalDateTime monthStart  = LocalDateTime.now().minusDays(30);

        return DashboardStatsDto.builder()
                .totalVisitors(visitorRepository.count())
                .uniqueVisitors(visitorRepository.countDistinctIpAddresses())
                .todayVisitors(visitorRepository.countByVisitedAtAfter(todayStart))
                .weekVisitors(visitorRepository.countByVisitedAtAfter(weekStart))
                .monthVisitors(visitorRepository.countByVisitedAtAfter(monthStart))
                .totalContacts(contactMessageRepository.count())
                .unreadContacts(contactMessageRepository.countByIsRead(false))
                .totalProjects(projectRepository.count())
                .totalSkills(skillRepository.count())
                .resumeDownloads(resumeDownloadRepository.count())
                .todayResumeDownloads(resumeDownloadRepository.countByDownloadedAtAfter(todayStart))
                .weekResumeDownloads(resumeDownloadRepository.countByDownloadedAtAfter(weekStart))
                .build();
    }
}

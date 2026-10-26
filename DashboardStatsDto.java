package com.sachin.portfolio.dto;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsDto {
    private Long totalVisitors;
    private Long uniqueVisitors;
    private Long todayVisitors;
    private Long weekVisitors;
    private Long monthVisitors;
    private Long totalContacts;
    private Long unreadContacts;
    private Long totalProjects;
    private Long totalSkills;
    private Long resumeDownloads;
    private Long todayResumeDownloads;
    private Long weekResumeDownloads;
}

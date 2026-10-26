package com.sachin.portfolio.repository;

import com.sachin.portfolio.model.ResumeDownload;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;

public interface ResumeDownloadRepository extends JpaRepository<ResumeDownload, Long> {
    long countByDownloadedAtAfter(LocalDateTime since);
    long countByDownloadedAtBetween(LocalDateTime start, LocalDateTime end);
}

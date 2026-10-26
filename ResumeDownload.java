package com.sachin.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Resume download tracking entity.
 * Records every resume download with IP and timestamp.
 */
@Entity
@Table(name = "resume_downloads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeDownload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(length = 80)
    private String country;

    @Column(name = "downloaded_at", updatable = false)
    @Builder.Default
    private LocalDateTime downloadedAt = LocalDateTime.now();
}

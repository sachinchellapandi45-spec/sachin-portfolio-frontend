package com.sachin.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Project entity - stores portfolio projects managed via admin panel.
 * All changes automatically reflect on the public portfolio.
 */
@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "tech_stack", length = 500)
    private String techStack; // Comma-separated: "Java,Spring Boot,React,MySQL"

    @Column(name = "github_link", length = 255)
    private String githubLink;

    @Column(name = "demo_link", length = 255)
    private String demoLink;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "COMING_SOON"; // ACTIVE, COMING_SOON, ARCHIVED

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

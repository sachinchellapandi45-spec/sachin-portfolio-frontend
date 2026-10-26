package com.sachin.portfolio.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/** Project DTO for create/update operations */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    @NotBlank(message = "Title is required")
    @Size(max = 150)
    private String title;

    private String description;

    @Size(max = 500)
    private String techStack;

    @Size(max = 255)
    private String githubLink;

    @Size(max = 255)
    private String demoLink;

    @Size(max = 255)
    private String imageUrl;

    private Integer displayOrder;

    private Boolean isFeatured;

    private String status; // ACTIVE, COMING_SOON, ARCHIVED
}

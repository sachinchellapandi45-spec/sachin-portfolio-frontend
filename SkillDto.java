package com.sachin.portfolio.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/** Skill DTO for create/update operations */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDto {
    @NotBlank(message = "Skill name is required")
    @Size(max = 80)
    private String name;

    @Size(max = 50)
    private String category;

    @Min(0) @Max(100)
    private Integer percentage;

    @Size(max = 255)
    private String iconUrl;

    private Integer displayOrder;

    private Boolean isActive;
}

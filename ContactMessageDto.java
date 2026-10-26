package com.sachin.portfolio.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/** Contact form submission DTO - validated before saving */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageDto {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name too long")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    @Size(max = 150)
    private String email;

    @Size(max = 200)
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(max = 5000, message = "Message too long")
    private String message;
}

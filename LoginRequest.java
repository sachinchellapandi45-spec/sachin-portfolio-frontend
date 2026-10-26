package com.sachin.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Login request payload from admin login form */
@Data
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}

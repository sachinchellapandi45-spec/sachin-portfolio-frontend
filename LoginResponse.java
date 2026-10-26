package com.sachin.portfolio.dto;

import lombok.*;

/** JWT login response returned to the admin frontend */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private String username;
    private String role;
    private long expiresIn; // milliseconds
}

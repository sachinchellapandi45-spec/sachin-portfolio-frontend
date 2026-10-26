package com.sachin.portfolio.service;

import com.sachin.portfolio.dto.*;
import com.sachin.portfolio.model.User;
import com.sachin.portfolio.repository.UserRepository;
import com.sachin.portfolio.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Authentication service - handles login, token generation, and admin user seeding.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticate admin user and return JWT token.
     * Credentials verified against BCrypt hash in DB.
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        // Update last login timestamp
        userRepository.findByUsername(request.getUsername()).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .role(user.getRole())
                .expiresIn(jwtTokenProvider.getExpirationMs())
                .build();
    }

    /**
     * Seed default admin user on first startup if none exists,
     * or repair credentials if the stored password hash is invalid/empty.
     */
    @Transactional
    public void seedDefaultAdmin() {
        java.util.Optional<User> existing = userRepository.findByUsername("sachin_admin");
        if (existing.isEmpty()) {
            User admin = User.builder()
                    .username("sachin_admin")
                    .passwordHash(passwordEncoder.encode("Admin@2026!"))
                    .email("sachinchellapandi45@gmail.com")
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Default admin user created: sachin_admin / Admin@2026!");
        } else {
            User admin = existing.get();
            if (admin.getPasswordHash() == null || admin.getPasswordHash().isBlank() || !admin.getPasswordHash().startsWith("$2")) {
                admin.setPasswordHash(passwordEncoder.encode("Admin@2026!"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("✅ Repaired default admin user credentials: sachin_admin / Admin@2026!");
            }
        }
    }
}

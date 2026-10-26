package com.sachin.portfolio;

import com.sachin.portfolio.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

/**
 * Main entry point for Sachin C Portfolio Backend Application.
 * Spring Boot 3.2 | Java 21 | MySQL | JWT | Spring Security
 */
@SpringBootApplication
@RequiredArgsConstructor
public class PortfolioApplication {

    private final AuthService authService;

    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        // Seed the default admin user on first startup (or repair if corrupted)
        authService.seedDefaultAdmin();

        System.out.println("""
            ╔═══════════════════════════════════════════════════╗
            ║   Sachin C - Portfolio Backend Started!           ║
            ║   Admin Panel: http://localhost:8080/admin        ║
            ║   API Base:    http://localhost:8080/api          ║
            ║   Default:     sachin_admin / Admin@2026!         ║
            ╚═══════════════════════════════════════════════════╝
            """);
    }
}

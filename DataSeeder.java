package com.sachin.portfolio.config;

import com.sachin.portfolio.model.Project;
import com.sachin.portfolio.model.Skill;
import com.sachin.portfolio.repository.ProjectRepository;
import com.sachin.portfolio.repository.SkillRepository;
import com.sachin.portfolio.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Runs on application startup:
 * 1. Seeds default admin user if not present or repairs corrupted credentials.
 * 2. Seeds initial portfolio projects & skills if repositories are empty.
 */
@Configuration
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final AuthService authService;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;

    @Override
    public void run(ApplicationArguments args) {
        authService.seedDefaultAdmin();
        seedInitialProjects();
        seedInitialSkills();
    }

    private void seedInitialProjects() {
        if (projectRepository.count() == 0) {
            List<Project> projects = List.of(
                Project.builder()
                    .title("Portfolio Backend & Admin Portal")
                    .description("Full-stack Java Spring Boot REST API with JWT authentication, visitor analytics tracking, contact form handling, and interactive dashboard.")
                    .techStack("Java, Spring Boot, Spring Security, JWT, MySQL, REST API")
                    .githubLink("https://github.com/sachinchellapandi45-spec/sachin-portfolio")
                    .demoLink("https://sachinchellapandi45-spec.github.io/sachin-portfolio")
                    .isFeatured(true)
                    .status("ACTIVE")
                    .displayOrder(1)
                    .build(),
                Project.builder()
                    .title("Modern Developer Portfolio")
                    .description("High-performance responsive personal portfolio featuring dynamic glassmorphism UI, custom cursor, magnetic buttons, and theme integration.")
                    .techStack("HTML5, CSS3, JavaScript, Responsive Design")
                    .githubLink("https://github.com/sachinchellapandi45-spec/sachin-portfolio")
                    .demoLink("https://sachinchellapandi45-spec.github.io/sachin-portfolio")
                    .isFeatured(true)
                    .status("ACTIVE")
                    .displayOrder(2)
                    .build(),
                Project.builder()
                    .title("Employee Management System")
                    .description("Enterprise CRUD web application for managing workforce profiles, department assignments, and role-based permissions.")
                    .techStack("Java, Spring Boot, Hibernate, MySQL, Maven")
                    .githubLink("https://github.com/sachinchellapandi45-spec")
                    .isFeatured(false)
                    .status("ACTIVE")
                    .displayOrder(3)
                    .build()
            );
            projectRepository.saveAll(projects);
            System.out.println("✅ Seeded " + projects.size() + " initial projects.");
        }
    }

    private void seedInitialSkills() {
        if (skillRepository.count() == 0) {
            List<Skill> skills = List.of(
                Skill.builder().name("Java").category("Languages").percentage(90).displayOrder(1).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg").build(),
                Skill.builder().name("JavaScript").category("Languages").percentage(85).displayOrder(2).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg").build(),
                Skill.builder().name("HTML5").category("Languages").percentage(90).displayOrder(3).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg").build(),
                Skill.builder().name("CSS3").category("Languages").percentage(85).displayOrder(4).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg").build(),
                Skill.builder().name("React JS").category("Frontend").percentage(80).displayOrder(1).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg").build(),
                Skill.builder().name("Spring Boot").category("Backend").percentage(85).displayOrder(1).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg").build(),
                Skill.builder().name("REST APIs").category("Backend").percentage(88).displayOrder(2).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg").build(),
                Skill.builder().name("MySQL").category("Database").percentage(85).displayOrder(1).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg").build(),
                Skill.builder().name("Git & GitHub").category("Tools").percentage(85).displayOrder(1).iconUrl("https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg").build()
            );
            skillRepository.saveAll(skills);
            System.out.println("✅ Seeded " + skills.size() + " initial skills.");
        }
    }
}

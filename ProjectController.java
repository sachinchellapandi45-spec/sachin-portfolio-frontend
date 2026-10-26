package com.sachin.portfolio.controller;

import com.sachin.portfolio.dto.ProjectDto;
import com.sachin.portfolio.model.Project;
import com.sachin.portfolio.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /** GET /api/projects - Public: list active projects for portfolio */
    @GetMapping("/api/projects")
    public ResponseEntity<List<Project>> getPublicProjects() {
        return ResponseEntity.ok(projectService.getActiveProjects());
    }

    /** GET /api/admin/projects - Admin: all projects */
    @GetMapping("/api/admin/projects")
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    /** GET /api/admin/projects/{id} */
    @GetMapping("/api/admin/projects/{id}")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    /** POST /api/admin/projects - Create project */
    @PostMapping("/api/admin/projects")
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(dto));
    }

    /** PUT /api/admin/projects/{id} - Update project */
    @PutMapping("/api/admin/projects/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    /** DELETE /api/admin/projects/{id} - Delete project */
    @DeleteMapping("/api/admin/projects/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }
}

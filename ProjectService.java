package com.sachin.portfolio.service;

import com.sachin.portfolio.dto.ProjectDto;
import com.sachin.portfolio.exception.ResourceNotFoundException;
import com.sachin.portfolio.model.Project;
import com.sachin.portfolio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<Project> getActiveProjects() {
        return projectRepository.findByStatusOrderByDisplayOrderAsc("ACTIVE");
    }

    @Transactional
    public Project createProject(ProjectDto dto) {
        Project project = Project.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .techStack(dto.getTechStack())
                .githubLink(dto.getGithubLink())
                .demoLink(dto.getDemoLink())
                .imageUrl(dto.getImageUrl())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false)
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, ProjectDto dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        if (dto.getTitle() != null) project.setTitle(dto.getTitle());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getTechStack() != null) project.setTechStack(dto.getTechStack());
        if (dto.getGithubLink() != null) project.setGithubLink(dto.getGithubLink());
        if (dto.getDemoLink() != null) project.setDemoLink(dto.getDemoLink());
        if (dto.getImageUrl() != null) project.setImageUrl(dto.getImageUrl());
        if (dto.getDisplayOrder() != null) project.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getIsFeatured() != null) project.setIsFeatured(dto.getIsFeatured());
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        projectRepository.deleteById(id);
    }

    public Project getById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }
}

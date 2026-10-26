package com.sachin.portfolio.repository;

import com.sachin.portfolio.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByOrderByDisplayOrderAsc();
    List<Project> findByStatusOrderByDisplayOrderAsc(String status);
    List<Project> findByIsFeaturedTrueOrderByDisplayOrderAsc();
}

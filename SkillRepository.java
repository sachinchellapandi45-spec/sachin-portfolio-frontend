package com.sachin.portfolio.repository;

import com.sachin.portfolio.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Skill> findByCategoryOrderByDisplayOrderAsc(String category);
    List<Skill> findAllByOrderByDisplayOrderAsc();
}

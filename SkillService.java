package com.sachin.portfolio.service;

import com.sachin.portfolio.dto.SkillDto;
import com.sachin.portfolio.exception.ResourceNotFoundException;
import com.sachin.portfolio.model.Skill;
import com.sachin.portfolio.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    public List<Skill> getAllSkills() {
        return skillRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<Skill> getActiveSkills() {
        return skillRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    @Transactional
    public Skill createSkill(SkillDto dto) {
        Skill skill = Skill.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .percentage(dto.getPercentage() != null ? dto.getPercentage() : 80)
                .iconUrl(dto.getIconUrl())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return skillRepository.save(skill);
    }

    @Transactional
    public Skill updateSkill(Long id, SkillDto dto) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + id));
        if (dto.getName() != null) skill.setName(dto.getName());
        if (dto.getCategory() != null) skill.setCategory(dto.getCategory());
        if (dto.getPercentage() != null) skill.setPercentage(dto.getPercentage());
        if (dto.getIconUrl() != null) skill.setIconUrl(dto.getIconUrl());
        if (dto.getDisplayOrder() != null) skill.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getIsActive() != null) skill.setIsActive(dto.getIsActive());
        return skillRepository.save(skill);
    }

    @Transactional
    public void deleteSkill(Long id) {
        skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + id));
        skillRepository.deleteById(id);
    }
}

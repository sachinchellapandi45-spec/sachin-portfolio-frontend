package com.sachin.portfolio.controller;

import com.sachin.portfolio.dto.SkillDto;
import com.sachin.portfolio.model.Skill;
import com.sachin.portfolio.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    /** GET /api/skills - Public: active skills for portfolio */
    @GetMapping("/api/skills")
    public ResponseEntity<List<Skill>> getPublicSkills() {
        return ResponseEntity.ok(skillService.getActiveSkills());
    }

    /** GET /api/admin/skills - Admin: all skills */
    @GetMapping("/api/admin/skills")
    public ResponseEntity<List<Skill>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    /** POST /api/admin/skills - Create skill */
    @PostMapping("/api/admin/skills")
    public ResponseEntity<Skill> createSkill(@Valid @RequestBody SkillDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillService.createSkill(dto));
    }

    /** PUT /api/admin/skills/{id} - Update skill */
    @PutMapping("/api/admin/skills/{id}")
    public ResponseEntity<Skill> updateSkill(@PathVariable Long id, @RequestBody SkillDto dto) {
        return ResponseEntity.ok(skillService.updateSkill(id, dto));
    }

    /** DELETE /api/admin/skills/{id} - Delete skill */
    @DeleteMapping("/api/admin/skills/{id}")
    public ResponseEntity<Map<String, String>> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }
}

package com.examly.springapp.controller;

import com.examly.springapp.dto.ScholarshipApplyDto;
import com.examly.springapp.dto.ScholarshipReviewDto;
import com.examly.springapp.entity.Scholarship;
import com.examly.springapp.service.ScholarshipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scholarships")
public class ScholarshipController {

    @Autowired
    private ScholarshipService scholarshipService;

    // SRS Appendix H: POST /api/scholarships/apply
    @PostMapping("/apply")
    public ResponseEntity<Scholarship> applyForScholarship(@Valid @RequestBody ScholarshipApplyDto dto) {
        Scholarship saved = scholarshipService.applyForScholarship(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/scholarships/queue - Finance review queue
    @GetMapping("/queue")
    public ResponseEntity<List<Scholarship>> getPendingQueue() {
        return ResponseEntity.ok(scholarshipService.getPendingScholarships());
    }

    // GET /api/scholarships
    @GetMapping
    public ResponseEntity<List<Scholarship>> getAllScholarships() {
        return ResponseEntity.ok(scholarshipService.getAllScholarships());
    }

    // GET /api/scholarships/applicant/{applicantId}
    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Scholarship>> getByApplicant(@PathVariable Long applicantId) {
        return ResponseEntity.ok(scholarshipService.getScholarshipsByApplicant(applicantId));
    }

    // GET /api/scholarships/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Scholarship> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scholarshipService.getScholarshipById(id));
    }

    // PUT /api/scholarships/{id}/review - Finance Officer approval/rejection
    @PutMapping("/{id}/review")
    public ResponseEntity<Scholarship> reviewScholarship(
            @PathVariable Long id,
            @Valid @RequestBody ScholarshipReviewDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String reviewer = auth != null ? auth.getName() : "finance@cams.edu";
        return ResponseEntity.ok(scholarshipService.reviewScholarship(id, dto, reviewer));
    }
}

package com.examly.springapp.controller;

import com.examly.springapp.dto.ApplicationSubmissionDto;
import com.examly.springapp.dto.MeritCandidateDto;
import com.examly.springapp.dto.StatusResponseDto;
import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.ApplicationStatus;
import com.examly.springapp.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // Backward-compatible endpoint: POST /api/applications?applicantId=1&programmeId=2&preferenceRank=1
    @PostMapping
    public ResponseEntity<AdmissionApplication> submitApplication(
            @RequestParam(required = false) Long applicantId,
            @RequestParam(required = false) Long programmeId,
            @RequestParam(required = false) Integer preferenceRank,
            @RequestBody(required = false) Map<String, Object> body) {

        if (applicantId == null && body != null && body.containsKey("applicantId")) {
            applicantId = Long.valueOf(body.get("applicantId").toString());
        }
        if (programmeId == null && body != null && body.containsKey("programmeId")) {
            programmeId = Long.valueOf(body.get("programmeId").toString());
        }
        if (preferenceRank == null && body != null && body.containsKey("preferenceRank")) {
            preferenceRank = Integer.valueOf(body.get("preferenceRank").toString());
        }

        if (applicantId == null || programmeId == null || preferenceRank == null) {
            throw new IllegalArgumentException("applicantId, programmeId, and preferenceRank are required");
        }

        AdmissionApplication saved = applicationService.submitApplication(applicantId, programmeId, preferenceRank);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // FR4: Multi-preference application endpoint
    @PostMapping("/multi-step")
    public ResponseEntity<List<AdmissionApplication>> submitMultiPreference(
            @Valid @RequestBody ApplicationSubmissionDto dto) {
        List<AdmissionApplication> applications = applicationService.submitMultiPreferenceApplication(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(applications);
    }

    @GetMapping
    public ResponseEntity<List<AdmissionApplication>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdmissionApplication> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<AdmissionApplication>> getByApplicant(@PathVariable Long applicantId) {
        return ResponseEntity.ok(applicationService.getApplicationsByApplicant(applicantId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdmissionApplication> updateStatus(@PathVariable Long id,
                                                               @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }

    // SRS Appendix H: PUT /api/applications/{id}/documents
    @PutMapping("/{id}/documents")
    public ResponseEntity<AdmissionApplication> updateDocuments(@PathVariable Long id) {
        AdmissionApplication app = applicationService.getApplicationById(id);
        return ResponseEntity.ok(app);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.ok("Application deleted successfully");
    }

    // FR5: merit list, optionally filtered by category
    @GetMapping("/merit-list/{programmeId}")
    public ResponseEntity<List<AdmissionApplication>> getMeritList(@PathVariable Long programmeId,
                                                                     @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(applicationService.getMeritListByCategory(programmeId, category));
        }
        return ResponseEntity.ok(applicationService.getMeritList(programmeId));
    }

    // Enhanced merit list with DTO details
    @GetMapping("/detailed-merit/{programmeId}")
    public ResponseEntity<List<MeritCandidateDto>> getDetailedMeritList(@PathVariable Long programmeId,
                                                                        @RequestParam(required = false) String category) {
        return ResponseEntity.ok(applicationService.getDetailedMeritList(programmeId, category));
    }

    // SRS Appendix H & Section 3.1.1: GET /api/applications/status/{id}
    @GetMapping("/status/{identifier}")
    public ResponseEntity<StatusResponseDto> getApplicationStatus(@PathVariable String identifier) {
        return ResponseEntity.ok(applicationService.getStatusTimeline(identifier));
    }
}

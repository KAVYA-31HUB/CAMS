package com.examly.springapp.service;

import com.examly.springapp.dto.ScholarshipApplyDto;
import com.examly.springapp.dto.ScholarshipReviewDto;
import com.examly.springapp.entity.Applicant;
import com.examly.springapp.entity.Scholarship;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.ScholarshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScholarshipService {

    @Autowired
    private ScholarshipRepository scholarshipRepository;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    @Transactional
    public Scholarship applyForScholarship(ScholarshipApplyDto dto) {
        Applicant applicant = applicantService.getApplicantById(dto.getApplicantId());

        Scholarship scholarship = new Scholarship(
                applicant,
                dto.getSchemeName(),
                dto.getAnnualIncome(),
                dto.getRequestedAmount()
        );

        Scholarship saved = scholarshipRepository.save(scholarship);

        auditService.log(
                applicant.getUser() != null ? applicant.getUser().getId() : null,
                applicant.getEmail(),
                "APPLICANT",
                "SCHOLARSHIP_APPLIED",
                "Scholarship",
                saved.getId().toString(),
                "Applied for scholarship: " + dto.getSchemeName() + " (Amount: ₹" + dto.getRequestedAmount() + ")",
                "127.0.0.1"
        );

        if (applicant.getUser() != null) {
            notificationService.sendNotification(
                    applicant.getUser(),
                    "Scholarship Application Submitted",
                    "Your application for '" + dto.getSchemeName() + "' has been submitted to the Finance Office for review.",
                    "SCHOLARSHIP"
            );
        }

        return saved;
    }

    public List<Scholarship> getPendingScholarships() {
        return scholarshipRepository.findByStatus(Scholarship.ScholarshipStatus.PENDING);
    }

    public List<Scholarship> getAllScholarships() {
        return scholarshipRepository.findAll();
    }

    public List<Scholarship> getScholarshipsByApplicant(Long applicantId) {
        return scholarshipRepository.findByApplicant_Id(applicantId);
    }

    public Scholarship getScholarshipById(Long id) {
        return scholarshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found with id: " + id));
    }

    @Transactional
    public Scholarship reviewScholarship(Long id, ScholarshipReviewDto dto, String reviewerEmail) {
        Scholarship scholarship = getScholarshipById(id);

        scholarship.setStatus(dto.getStatus());
        scholarship.setRemarks(dto.getRemarks());
        scholarship.setReviewedBy(reviewerEmail != null ? reviewerEmail : "Finance Officer");
        scholarship.setReviewedAt(LocalDateTime.now());

        if (dto.getStatus() == Scholarship.ScholarshipStatus.APPROVED) {
            scholarship.setApprovedAmount(dto.getApprovedAmount() != null ? dto.getApprovedAmount() : scholarship.getRequestedAmount());
        } else {
            scholarship.setApprovedAmount(0.0);
        }

        Scholarship saved = scholarshipRepository.save(scholarship);

        auditService.log(
                null,
                reviewerEmail,
                "FINANCE",
                "SCHOLARSHIP_REVIEWED",
                "Scholarship",
                saved.getId().toString(),
                "Scholarship " + dto.getStatus().name() + " with amount ₹" + saved.getApprovedAmount(),
                "127.0.0.1"
        );

        if (scholarship.getApplicant().getUser() != null) {
            String msg = dto.getStatus() == Scholarship.ScholarshipStatus.APPROVED
                    ? "Congratulations! Your scholarship application for '" + scholarship.getSchemeName() + "' has been approved for ₹" + saved.getApprovedAmount() + ". This deduction will reflect on your fee statement."
                    : "Your scholarship application for '" + scholarship.getSchemeName() + "' was not approved. Remarks: " + (dto.getRemarks() != null ? dto.getRemarks() : "Criteria not met");

            notificationService.sendNotification(
                    scholarship.getApplicant().getUser(),
                    "Scholarship Decision: " + dto.getStatus().name(),
                    msg,
                    "SCHOLARSHIP"
            );
        }

        return saved;
    }
}

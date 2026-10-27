package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "scholarships")
public class Scholarship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Applicant applicant;

    @Column(nullable = false)
    private String schemeName;

    private Double annualIncome;

    private Double requestedAmount;

    private Double approvedAmount = 0.0;

    @Enumerated(EnumType.STRING)
    private ScholarshipStatus status = ScholarshipStatus.PENDING;

    private String remarks;

    private LocalDateTime appliedAt = LocalDateTime.now();

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    public enum ScholarshipStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    public Scholarship() {
    }

    public Scholarship(Applicant applicant, String schemeName, Double annualIncome, Double requestedAmount) {
        this.applicant = applicant;
        this.schemeName = schemeName;
        this.annualIncome = annualIncome;
        this.requestedAmount = requestedAmount;
        this.status = ScholarshipStatus.PENDING;
        this.appliedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Applicant getApplicant() { return applicant; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }

    public String getSchemeName() { return schemeName; }
    public void setSchemeName(String schemeName) { this.schemeName = schemeName; }

    public Double getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(Double annualIncome) { this.annualIncome = annualIncome; }

    public Double getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(Double requestedAmount) { this.requestedAmount = requestedAmount; }

    public Double getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(Double approvedAmount) { this.approvedAmount = approvedAmount; }

    public ScholarshipStatus getStatus() { return status; }
    public void setStatus(ScholarshipStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}

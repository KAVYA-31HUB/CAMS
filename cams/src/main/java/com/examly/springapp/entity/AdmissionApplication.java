package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class AdmissionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String applicationNumber;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Applicant applicant;

    @ManyToOne
    @JoinColumn(name = "programme_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Programme programme;

    @NotNull(message = "Preference rank is required")
    @Min(value = 1, message = "Preference rank must be between 1 and 5")
    @Max(value = 5, message = "Preference rank must be between 1 and 5")
    private Integer preferenceRank;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    private LocalDateTime appliedDate = LocalDateTime.now();

    private String academicYear = "2026-27";

    private Boolean upgradeRequested = false;

    private String allottedQuota;

    private Integer allottedRound;

    private LocalDateTime acceptanceDeadline;

    private Double meritScore;

    private Integer meritRank;

    private Integer categoryRank;

    public AdmissionApplication() {
    }

    public AdmissionApplication(Applicant applicant, Programme programme, Integer preferenceRank) {
        this.applicant = applicant;
        this.programme = programme;
        this.preferenceRank = preferenceRank;
        this.status = ApplicationStatus.SUBMITTED;
        this.appliedDate = LocalDateTime.now();
        this.academicYear = "2026-27";
        this.upgradeRequested = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public Applicant getApplicant() { return applicant; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }

    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }

    public Integer getPreferenceRank() { return preferenceRank; }
    public void setPreferenceRank(Integer preferenceRank) { this.preferenceRank = preferenceRank; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Boolean getUpgradeRequested() { return upgradeRequested; }
    public void setUpgradeRequested(Boolean upgradeRequested) { this.upgradeRequested = upgradeRequested; }

    public String getAllottedQuota() { return allottedQuota; }
    public void setAllottedQuota(String allottedQuota) { this.allottedQuota = allottedQuota; }

    public Integer getAllottedRound() { return allottedRound; }
    public void setAllottedRound(Integer allottedRound) { this.allottedRound = allottedRound; }

    public LocalDateTime getAcceptanceDeadline() { return acceptanceDeadline; }
    public void setAcceptanceDeadline(LocalDateTime acceptanceDeadline) { this.acceptanceDeadline = acceptanceDeadline; }

    public Double getMeritScore() { return meritScore; }
    public void setMeritScore(Double meritScore) { this.meritScore = meritScore; }

    public Integer getMeritRank() { return meritRank; }
    public void setMeritRank(Integer meritRank) { this.meritRank = meritRank; }

    public Integer getCategoryRank() { return categoryRank; }
    public void setCategoryRank(Integer categoryRank) { this.categoryRank = categoryRank; }
}

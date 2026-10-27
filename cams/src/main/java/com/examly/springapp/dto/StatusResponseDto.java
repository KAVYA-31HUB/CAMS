package com.examly.springapp.dto;

import com.examly.springapp.entity.ApplicationStatus;

import java.time.LocalDateTime;
import java.util.List;

public class StatusResponseDto {

    private String applicationNumber;
    private String applicantName;
    private String email;
    private ApplicationStatus currentStatus;
    private String academicYear;
    private LocalDateTime appliedDate;
    private List<ApplicationResponseDto> preferences;

    // Current Allotment if any
    private Boolean isAllotted;
    private String allottedProgramme;
    private String allottedQuota;
    private Integer allottedRound;
    private LocalDateTime acceptanceDeadline;
    private Boolean upgradeRequested;

    // Verification and Fee Status
    private String documentVerificationStatus;
    private String feeStatus;

    public StatusResponseDto() {
    }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public ApplicationStatus getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(ApplicationStatus currentStatus) { this.currentStatus = currentStatus; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }

    public List<ApplicationResponseDto> getPreferences() { return preferences; }
    public void setPreferences(List<ApplicationResponseDto> preferences) { this.preferences = preferences; }

    public Boolean getIsAllotted() { return isAllotted; }
    public void setIsAllotted(Boolean allotted) { isAllotted = allotted; }

    public String getAllottedProgramme() { return allottedProgramme; }
    public void setAllottedProgramme(String allottedProgramme) { this.allottedProgramme = allottedProgramme; }

    public String getAllottedQuota() { return allottedQuota; }
    public void setAllottedQuota(String allottedQuota) { this.allottedQuota = allottedQuota; }

    public Integer getAllottedRound() { return allottedRound; }
    public void setAllottedRound(Integer allottedRound) { this.allottedRound = allottedRound; }

    public LocalDateTime getAcceptanceDeadline() { return acceptanceDeadline; }
    public void setAcceptanceDeadline(LocalDateTime acceptanceDeadline) { this.acceptanceDeadline = acceptanceDeadline; }

    public Boolean getUpgradeRequested() { return upgradeRequested; }
    public void setUpgradeRequested(Boolean upgradeRequested) { this.upgradeRequested = upgradeRequested; }

    public String getDocumentVerificationStatus() { return documentVerificationStatus; }
    public void setDocumentVerificationStatus(String documentVerificationStatus) { this.documentVerificationStatus = documentVerificationStatus; }

    public String getFeeStatus() { return feeStatus; }
    public void setFeeStatus(String feeStatus) { this.feeStatus = feeStatus; }
}

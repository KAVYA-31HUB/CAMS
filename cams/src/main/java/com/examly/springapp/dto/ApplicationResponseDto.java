package com.examly.springapp.dto;

import com.examly.springapp.entity.ApplicationStatus;

import java.time.LocalDateTime;

public class ApplicationResponseDto {

    private Long id;
    private String applicationNumber;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;
    private String category;
    private Double boardPercentage;
    private Double entranceScore;

    private Long programmeId;
    private String programmeName;
    private String department;
    private Integer preferenceRank;

    private ApplicationStatus status;
    private LocalDateTime appliedDate;
    private String academicYear;
    private Boolean upgradeRequested;
    private String allottedQuota;
    private Integer allottedRound;
    private LocalDateTime acceptanceDeadline;
    private Double meritScore;
    private Integer meritRank;
    private Integer categoryRank;

    public ApplicationResponseDto() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }

    public String getApplicantPhone() { return applicantPhone; }
    public void setApplicantPhone(String applicantPhone) { this.applicantPhone = applicantPhone; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getBoardPercentage() { return boardPercentage; }
    public void setBoardPercentage(Double boardPercentage) { this.boardPercentage = boardPercentage; }

    public Double getEntranceScore() { return entranceScore; }
    public void setEntranceScore(Double entranceScore) { this.entranceScore = entranceScore; }

    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }

    public String getProgrammeName() { return programmeName; }
    public void setProgrammeName(String programmeName) { this.programmeName = programmeName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

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

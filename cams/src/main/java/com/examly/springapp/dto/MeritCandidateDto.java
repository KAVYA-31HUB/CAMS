package com.examly.springapp.dto;

import com.examly.springapp.entity.ApplicationStatus;

public class MeritCandidateDto {

    private Integer rank;
    private Integer categoryRank;
    private Long applicationId;
    private String applicationNumber;
    private Long applicantId;
    private String applicantName;
    private String category;
    private Double boardPercentage;
    private Double entranceScore;
    private Double meritScore;
    private Integer preferenceRank;
    private ApplicationStatus status;
    private Long programmeId;
    private String programmeName;

    public MeritCandidateDto() {
    }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public Integer getCategoryRank() { return categoryRank; }
    public void setCategoryRank(Integer categoryRank) { this.categoryRank = categoryRank; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getBoardPercentage() { return boardPercentage; }
    public void setBoardPercentage(Double boardPercentage) { this.boardPercentage = boardPercentage; }

    public Double getEntranceScore() { return entranceScore; }
    public void setEntranceScore(Double entranceScore) { this.entranceScore = entranceScore; }

    public Double getMeritScore() { return meritScore; }
    public void setMeritScore(Double meritScore) { this.meritScore = meritScore; }

    public Integer getPreferenceRank() { return preferenceRank; }
    public void setPreferenceRank(Integer preferenceRank) { this.preferenceRank = preferenceRank; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }

    public String getProgrammeName() { return programmeName; }
    public void setProgrammeName(String programmeName) { this.programmeName = programmeName; }
}

package com.examly.springapp.dto;

import java.util.List;

public class AllocationResultDto {

    private Long seatMatrixId;
    private Long programmeId;
    private String programmeName;
    private String quota;
    private Integer roundNo;
    private String academicYear;
    private Integer totalSeats;
    private Integer previouslyAllotted;
    private Integer newlyAllottedCount;
    private Integer totalAllottedNow;
    private Integer vacanciesRemaining;
    private List<ApplicationResponseDto> newlyAllottedApplications;

    public AllocationResultDto() {
    }

    public Long getSeatMatrixId() { return seatMatrixId; }
    public void setSeatMatrixId(Long seatMatrixId) { this.seatMatrixId = seatMatrixId; }

    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }

    public String getProgrammeName() { return programmeName; }
    public void setProgrammeName(String programmeName) { this.programmeName = programmeName; }

    public String getQuota() { return quota; }
    public void setQuota(String quota) { this.quota = quota; }

    public Integer getRoundNo() { return roundNo; }
    public void setRoundNo(Integer roundNo) { this.roundNo = roundNo; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Integer getPreviouslyAllotted() { return previouslyAllotted; }
    public void setPreviouslyAllotted(Integer previouslyAllotted) { this.previouslyAllotted = previouslyAllotted; }

    public Integer getNewlyAllottedCount() { return newlyAllottedCount; }
    public void setNewlyAllottedCount(Integer newlyAllottedCount) { this.newlyAllottedCount = newlyAllottedCount; }

    public Integer getTotalAllottedNow() { return totalAllottedNow; }
    public void setTotalAllottedNow(Integer totalAllottedNow) { this.totalAllottedNow = totalAllottedNow; }

    public Integer getVacanciesRemaining() { return vacanciesRemaining; }
    public void setVacanciesRemaining(Integer vacanciesRemaining) { this.vacanciesRemaining = vacanciesRemaining; }

    public List<ApplicationResponseDto> getNewlyAllottedApplications() { return newlyAllottedApplications; }
    public void setNewlyAllottedApplications(List<ApplicationResponseDto> newlyAllottedApplications) { this.newlyAllottedApplications = newlyAllottedApplications; }
}

package com.examly.springapp.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class ApplicationSubmissionDto {

    @NotNull(message = "Applicant ID is required")
    private Long applicantId;

    @NotEmpty(message = "At least one programme preference is required")
    @Size(min = 1, max = 5, message = "Up to 5 programme preferences allowed")
    private List<Long> programmeIds;

    private String academicYear = "2026-27";

    private Boolean isDraft = false;

    public ApplicationSubmissionDto() {
    }

    public ApplicationSubmissionDto(Long applicantId, List<Long> programmeIds) {
        this.applicantId = applicantId;
        this.programmeIds = programmeIds;
    }

    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

    public List<Long> getProgrammeIds() { return programmeIds; }
    public void setProgrammeIds(List<Long> programmeIds) { this.programmeIds = programmeIds; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Boolean getIsDraft() { return isDraft; }
    public void setIsDraft(Boolean draft) { isDraft = draft; }
}

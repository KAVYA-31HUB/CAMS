package com.examly.springapp.dto;

import com.examly.springapp.entity.Scholarship;
import jakarta.validation.constraints.NotNull;

public class ScholarshipReviewDto {

    @NotNull(message = "Review status is required")
    private Scholarship.ScholarshipStatus status;

    private Double approvedAmount = 0.0;

    private String remarks;

    public ScholarshipReviewDto() {
    }

    public Scholarship.ScholarshipStatus getStatus() { return status; }
    public void setStatus(Scholarship.ScholarshipStatus status) { this.status = status; }

    public Double getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(Double approvedAmount) { this.approvedAmount = approvedAmount; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

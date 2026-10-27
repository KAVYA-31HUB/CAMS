package com.examly.springapp.dto;

import com.examly.springapp.entity.VerificationStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class DocumentVerificationDto {

    @NotNull(message = "Verification status is required")
    @JsonProperty("verificationStatus")
    @JsonAlias("status")
    private VerificationStatus verificationStatus;

    private String remarks;

    public DocumentVerificationDto() {
    }

    public VerificationStatus getVerificationStatus() { 
        return verificationStatus; 
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) { 
        this.verificationStatus = verificationStatus; 
    }

    @JsonIgnore
    public VerificationStatus getStatus() { 
        return verificationStatus; 
    }

    @JsonIgnore
    public void setStatus(VerificationStatus status) { 
        this.verificationStatus = status; 
    }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}



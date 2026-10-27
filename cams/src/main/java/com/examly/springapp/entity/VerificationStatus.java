package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum VerificationStatus {
    PENDING,
    VERIFIED,
    DISCREPANT;

    @JsonCreator
    public static VerificationStatus fromString(String value) {
        if (value == null) return null;
        String normalized = value.trim().toUpperCase();
        if ("DISCREPANCY_FLAGGED".equals(normalized) || "FLAGGED".equals(normalized) || "REJECTED".equals(normalized)) {
            return DISCREPANT;
        }
        return VerificationStatus.valueOf(normalized);
    }
}


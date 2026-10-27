package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    APPLICANT,
    COUNSELLOR,
    PROGRAMME_COORDINATOR,
    COORDINATOR,
    REGISTRAR,
    FINANCE_OFFICER,
    FINANCE,
    ADMINISTRATOR,
    ADMIN;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null) return null;
        String normalized = value.trim().toUpperCase();
        return switch (normalized) {
            case "PROGRAMME_COORDINATOR", "COORDINATOR", "PROGRAMME_COORD" -> PROGRAMME_COORDINATOR;
            case "FINANCE_OFFICER", "FINANCE" -> FINANCE_OFFICER;
            case "ADMINISTRATOR", "ADMIN" -> ADMINISTRATOR;
            case "COUNSELLOR", "COUNSELOR" -> COUNSELLOR;
            case "APPLICANT" -> APPLICANT;
            case "REGISTRAR" -> REGISTRAR;
            default -> Role.valueOf(normalized);
        };
    }
}

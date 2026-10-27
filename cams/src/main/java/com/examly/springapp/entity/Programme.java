package com.examly.springapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "programmes")
public class Programme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    @NotBlank(message = "Programme name is required")
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Intake capacity is required")
    @Positive(message = "Intake capacity must be positive")
    private Integer intakeCapacity;

    private Integer durationYears;

    private Boolean isActive = true;

    // Configurable formula stored in database per programme (SRS FR5)
    // Example: {"boardWeight": 0.4, "entranceWeight": 0.6, "tieBreaker": "ENTRANCE_FIRST"}
    @Column(columnDefinition = "TEXT")
    private String meritFormula = "{\"boardWeight\":0.4,\"entranceWeight\":0.6,\"tieBreaker\":\"ENTRANCE_FIRST\"}";

    private Double tuitionFee = 75000.0;

    private Double otherFee = 15000.0;

    public Programme() {
    }

    public Programme(String name, String department, Integer intakeCapacity,
                      Integer durationYears, Boolean isActive) {
        this.name = name;
        this.department = department;
        this.intakeCapacity = intakeCapacity;
        this.durationYears = durationYears;
        this.isActive = isActive;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getIntakeCapacity() { return intakeCapacity; }
    public void setIntakeCapacity(Integer intakeCapacity) { this.intakeCapacity = intakeCapacity; }

    public Integer getDurationYears() { return durationYears; }
    public void setDurationYears(Integer durationYears) { this.durationYears = durationYears; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getMeritFormula() { return meritFormula; }
    public void setMeritFormula(String meritFormula) { this.meritFormula = meritFormula; }

    public Double getTuitionFee() { return tuitionFee; }
    public void setTuitionFee(Double tuitionFee) { this.tuitionFee = tuitionFee; }

    public Double getOtherFee() { return otherFee; }
    public void setOtherFee(Double otherFee) { this.otherFee = otherFee; }
}

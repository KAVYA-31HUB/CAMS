package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "seat_matrix")
public class SeatMatrix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "programme_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Programme programme;

    // GEN, OBC, SC, ST, EWS, SPORTS
    @NotBlank(message = "Quota is required")
    private String quota;

    @NotNull(message = "Total seats is required")
    @Positive(message = "Total seats must be positive")
    private Integer totalSeats;

    private Integer allotted = 0;

    @NotNull(message = "Round number is required")
    private Integer roundNo;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    public SeatMatrix() {
    }

    public SeatMatrix(Programme programme, String quota, Integer totalSeats, Integer roundNo, String academicYear) {
        this.programme = programme;
        this.quota = quota;
        this.totalSeats = totalSeats;
        this.allotted = 0;
        this.roundNo = roundNo;
        this.academicYear = academicYear;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }

    public String getQuota() { return quota; }
    public void setQuota(String quota) { this.quota = quota; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Integer getAllotted() { return allotted; }
    public void setAllotted(Integer allotted) { this.allotted = allotted; }

    public Integer getRoundNo() { return roundNo; }
    public void setRoundNo(Integer roundNo) { this.roundNo = roundNo; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    // Convenience method used by the allocation service
    public boolean hasVacancy() {
        return allotted < totalSeats;
    }
}

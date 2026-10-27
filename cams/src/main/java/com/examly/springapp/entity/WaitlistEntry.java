package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist_entries")
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AdmissionApplication application;

    @ManyToOne
    @JoinColumn(name = "programme_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Programme programme;

    @Column(nullable = false)
    private String quota;

    private Integer roundNo = 1;

    private Integer rankPosition;

    @Enumerated(EnumType.STRING)
    private WaitlistStatus status = WaitlistStatus.WAITING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum WaitlistStatus {
        WAITING,
        PROMOTED,
        EXPIRED,
        CANCELLED
    }

    public WaitlistEntry() {
    }

    public WaitlistEntry(AdmissionApplication application, Programme programme, String quota, Integer roundNo, Integer rankPosition) {
        this.application = application;
        this.programme = programme;
        this.quota = quota;
        this.roundNo = roundNo;
        this.rankPosition = rankPosition;
        this.status = WaitlistStatus.WAITING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AdmissionApplication getApplication() { return application; }
    public void setApplication(AdmissionApplication application) { this.application = application; }

    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }

    public String getQuota() { return quota; }
    public void setQuota(String quota) { this.quota = quota; }

    public Integer getRoundNo() { return roundNo; }
    public void setRoundNo(Integer roundNo) { this.roundNo = roundNo; }

    public Integer getRankPosition() { return rankPosition; }
    public void setRankPosition(Integer rankPosition) { this.rankPosition = rankPosition; }

    public WaitlistStatus getStatus() { return status; }
    public void setStatus(WaitlistStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

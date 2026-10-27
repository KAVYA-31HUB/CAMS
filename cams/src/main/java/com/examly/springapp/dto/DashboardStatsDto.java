package com.examly.springapp.dto;

import java.util.Map;

public class DashboardStatsDto {

    private long totalApplicants;
    private long totalApplications;
    private long underVerification;
    private long verified;
    private long allotted;
    private long feePaid;
    private long joined;
    private long cancelled;

    private int totalProgrammes;
    private int totalSeats;
    private int totalSeatsAllotted;
    private int totalVacancies;
    private double overallFillRate;

    private double totalFeeCollected;
    private double totalScholarshipsApproved;
    private long pendingScholarships;

    private Map<String, Long> categoryWiseApplications;
    private Map<String, Long> programmeWiseApplications;

    public DashboardStatsDto() {
    }

    public long getTotalApplicants() { return totalApplicants; }
    public void setTotalApplicants(long totalApplicants) { this.totalApplicants = totalApplicants; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getUnderVerification() { return underVerification; }
    public void setUnderVerification(long underVerification) { this.underVerification = underVerification; }

    public long getVerified() { return verified; }
    public void setVerified(long verified) { this.verified = verified; }

    public long getAllotted() { return allotted; }
    public void setAllotted(long allotted) { this.allotted = allotted; }

    public long getFeePaid() { return feePaid; }
    public void setFeePaid(long feePaid) { this.feePaid = feePaid; }

    public long getJoined() { return joined; }
    public void setJoined(long joined) { this.joined = joined; }

    public long getCancelled() { return cancelled; }
    public void setCancelled(long cancelled) { this.cancelled = cancelled; }

    public int getTotalProgrammes() { return totalProgrammes; }
    public void setTotalProgrammes(int totalProgrammes) { this.totalProgrammes = totalProgrammes; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public int getTotalSeatsAllotted() { return totalSeatsAllotted; }
    public void setTotalSeatsAllotted(int totalSeatsAllotted) { this.totalSeatsAllotted = totalSeatsAllotted; }

    public int getTotalVacancies() { return totalVacancies; }
    public void setTotalVacancies(int totalVacancies) { this.totalVacancies = totalVacancies; }

    public double getOverallFillRate() { return overallFillRate; }
    public void setOverallFillRate(double overallFillRate) { this.overallFillRate = overallFillRate; }

    public double getTotalFeeCollected() { return totalFeeCollected; }
    public void setTotalFeeCollected(double totalFeeCollected) { this.totalFeeCollected = totalFeeCollected; }

    public double getTotalScholarshipsApproved() { return totalScholarshipsApproved; }
    public void setTotalScholarshipsApproved(Double totalScholarshipsApproved) { this.totalScholarshipsApproved = totalScholarshipsApproved != null ? totalScholarshipsApproved : 0.0; }

    public long getPendingScholarships() { return pendingScholarships; }
    public void setPendingScholarships(long pendingScholarships) { this.pendingScholarships = pendingScholarships; }

    public Map<String, Long> getCategoryWiseApplications() { return categoryWiseApplications; }
    public void setCategoryWiseApplications(Map<String, Long> categoryWiseApplications) { this.categoryWiseApplications = categoryWiseApplications; }

    public Map<String, Long> getProgrammeWiseApplications() { return programmeWiseApplications; }
    public void setProgrammeWiseApplications(Map<String, Long> programmeWiseApplications) { this.programmeWiseApplications = programmeWiseApplications; }
}

package com.examly.springapp.dto;

public class AdminUserStatsDto {

    private long totalUsers;
    private long applicants;
    private long counsellors;
    private long programmeCoordinators;
    private long registrars;
    private long financeOfficers;
    private long administrators;

    public AdminUserStatsDto() {
    }

    public AdminUserStatsDto(long totalUsers, long applicants, long counsellors,
                             long programmeCoordinators, long registrars,
                             long financeOfficers, long administrators) {
        this.totalUsers = totalUsers;
        this.applicants = applicants;
        this.counsellors = counsellors;
        this.programmeCoordinators = programmeCoordinators;
        this.registrars = registrars;
        this.financeOfficers = financeOfficers;
        this.administrators = administrators;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getApplicants() { return applicants; }
    public void setApplicants(long applicants) { this.applicants = applicants; }

    public long getCounsellors() { return counsellors; }
    public void setCounsellors(long counsellors) { this.counsellors = counsellors; }

    public long getProgrammeCoordinators() { return programmeCoordinators; }
    public void setProgrammeCoordinators(long programmeCoordinators) { this.programmeCoordinators = programmeCoordinators; }

    public long getRegistrars() { return registrars; }
    public void setRegistrars(long registrars) { this.registrars = registrars; }

    public long getFinanceOfficers() { return financeOfficers; }
    public void setFinanceOfficers(long financeOfficers) { this.financeOfficers = financeOfficers; }

    public long getAdministrators() { return administrators; }
    public void setAdministrators(long administrators) { this.administrators = administrators; }
}

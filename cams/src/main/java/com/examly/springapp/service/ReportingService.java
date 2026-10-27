package com.examly.springapp.service;

import com.examly.springapp.dto.DashboardStatsDto;
import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.ApplicationStatus;
import com.examly.springapp.entity.Programme;
import com.examly.springapp.entity.SeatMatrix;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportingService {

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private ScholarshipRepository scholarshipRepository;

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotalApplicants(applicantRepository.count());
        stats.setTotalApplications(applicationRepository.count());

        stats.setUnderVerification(applicationRepository.countByStatus(ApplicationStatus.SUBMITTED));
        stats.setVerified(applicationRepository.countByStatus(ApplicationStatus.VERIFIED));
        stats.setAllotted(applicationRepository.countByStatus(ApplicationStatus.ALLOTTED));
        stats.setJoined(applicationRepository.countByStatus(ApplicationStatus.JOINED));
        stats.setCancelled(applicationRepository.countByStatus(ApplicationStatus.CANCELLED));

        List<Programme> programmes = programmeRepository.findAll();
        stats.setTotalProgrammes(programmes.size());

        List<SeatMatrix> seatMatrixList = seatMatrixRepository.findAll();
        int totalSeats = seatMatrixList.stream().mapToInt(SeatMatrix::getTotalSeats).sum();
        int allottedSeats = seatMatrixList.stream().mapToInt(SeatMatrix::getAllotted).sum();

        stats.setTotalSeats(totalSeats);
        stats.setTotalSeatsAllotted(allottedSeats);
        stats.setTotalVacancies(Math.max(0, totalSeats - allottedSeats));
        stats.setOverallFillRate(totalSeats > 0 ? Math.round(((double) allottedSeats / totalSeats) * 1000.0) / 10.0 : 0.0);

        Double collections = feePaymentRepository.getTotalCollections();
        stats.setTotalFeeCollected(collections != null ? collections : 0.0);

        Double scholarships = scholarshipRepository.getTotalApprovedScholarships();
        stats.setTotalScholarshipsApproved(scholarships != null ? scholarships : 0.0);
        stats.setPendingScholarships(scholarshipRepository.countByStatus(com.examly.springapp.entity.Scholarship.ScholarshipStatus.PENDING));

        // Category-wise application counts
        List<AdmissionApplication> allApps = applicationRepository.findAll();
        Map<String, Long> catCounts = allApps.stream()
                .collect(Collectors.groupingBy(a -> a.getApplicant().getCategory(), Collectors.counting()));
        stats.setCategoryWiseApplications(catCounts);

        // Programme-wise application counts
        Map<String, Long> progCounts = allApps.stream()
                .collect(Collectors.groupingBy(a -> a.getProgramme().getName(), Collectors.counting()));
        stats.setProgrammeWiseApplications(progCounts);

        return stats;
    }

    // FR9: Application funnel metrics
    public Map<String, Object> getFunnelReport() {
        Map<String, Object> funnel = new LinkedHashMap<>();
        long applied = applicationRepository.count();
        long verified = applicationRepository.countByStatus(ApplicationStatus.VERIFIED);
        long allotted = applicationRepository.countByStatus(ApplicationStatus.ALLOTTED);
        long admitted = applicationRepository.countByStatus(ApplicationStatus.JOINED);
        long cancelled = applicationRepository.countByStatus(ApplicationStatus.CANCELLED);

        funnel.put("applied", applied);
        funnel.put("verified", verified);
        funnel.put("allotted", allotted);
        funnel.put("admitted", admitted);
        funnel.put("cancelled", cancelled);
        funnel.put("conversionRate", applied > 0 ? Math.round(((double) admitted / applied) * 1000.0) / 10.0 : 0.0);

        return funnel;
    }

    // FR9: AISHE Regulatory Report (All India Survey on Higher Education)
    public List<Map<String, Object>> getAisheReport() {
        List<Programme> programmes = programmeRepository.findAll();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Programme p : programmes) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("programmeCode", p.getCode() != null ? p.getCode() : "PROG-" + p.getId());
            row.put("programmeName", p.getName());
            row.put("department", p.getDepartment());
            row.put("durationYears", p.getDurationYears());
            row.put("approvedIntake", p.getIntakeCapacity());

            List<AdmissionApplication> apps = applicationRepository.findByProgramme_Id(p.getId());
            long totalEnrolled = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED).count();
            row.put("totalEnrolled", totalEnrolled);

            // Reservation distribution
            long gen = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED && "GEN".equalsIgnoreCase(a.getApplicant().getCategory())).count();
            long obc = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED && "OBC".equalsIgnoreCase(a.getApplicant().getCategory())).count();
            long sc = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED && "SC".equalsIgnoreCase(a.getApplicant().getCategory())).count();
            long st = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED && "ST".equalsIgnoreCase(a.getApplicant().getCategory())).count();
            long ews = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED && "EWS".equalsIgnoreCase(a.getApplicant().getCategory())).count();

            row.put("general", gen);
            row.put("obc", obc);
            row.put("sc", sc);
            row.put("st", st);
            row.put("ews", ews);

            // Gender distribution
            long male = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED && "Male".equalsIgnoreCase(a.getApplicant().getGender())).count();
            long female = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED && "Female".equalsIgnoreCase(a.getApplicant().getGender())).count();
            row.put("male", male);
            row.put("female", female);

            rows.add(row);
        }

        return rows;
    }

    // FR9: UGC Compliance Report (Intake vs Actual Admission and Vacancy)
    public List<Map<String, Object>> getUgcReport() {
        List<Programme> programmes = programmeRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Programme p : programmes) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("programmeName", p.getName());
            map.put("department", p.getDepartment());
            map.put("sanctionedIntake", p.getIntakeCapacity());

            List<SeatMatrix> matrix = seatMatrixRepository.findByProgramme_Id(p.getId());
            int matrixSeats = matrix.stream().mapToInt(SeatMatrix::getTotalSeats).sum();
            int matrixAllotted = matrix.stream().mapToInt(SeatMatrix::getAllotted).sum();

            map.put("configuredSeats", matrixSeats > 0 ? matrixSeats : p.getIntakeCapacity());
            map.put("admittedSeats", matrixAllotted);
            map.put("vacancies", Math.max(0, (matrixSeats > 0 ? matrixSeats : p.getIntakeCapacity()) - matrixAllotted));
            map.put("complianceStatus", matrixAllotted <= p.getIntakeCapacity() ? "COMPLIANT" : "OVER_CAPACITY");

            report.add(map);
        }

        return report;
    }
}

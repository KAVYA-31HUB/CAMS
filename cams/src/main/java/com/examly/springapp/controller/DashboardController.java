package com.examly.springapp.controller;

import com.examly.springapp.dto.DashboardStatsDto;
import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.ApplicationStatus;
import com.examly.springapp.entity.PaymentStatus;
import com.examly.springapp.entity.Programme;
import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.SeatMatrix;
import com.examly.springapp.repository.AdmissionApplicationRepository;
import com.examly.springapp.repository.ApplicantRepository;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.repository.FeePaymentRepository;
import com.examly.springapp.repository.ProgrammeRepository;
import com.examly.springapp.repository.SeatMatrixRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ReportingService reportingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    // GET /api/dashboard/stats - General metrics
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getGeneralStats() {
        return ResponseEntity.ok(reportingService.getDashboardStats());
    }

    // GET /api/dashboard/programme-coordinator (Part 15 & Part 20)
    @GetMapping("/programme-coordinator")
    public ResponseEntity<Map<String, Object>> getCoordinatorMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();

        List<Programme> programmes = programmeRepository.findAll();
        List<SeatMatrix> matrices = seatMatrixRepository.findAll();
        List<AdmissionApplication> applications = applicationRepository.findAll();

        int totalSeats = matrices.stream().mapToInt(SeatMatrix::getTotalSeats).sum();
        int allocatedSeats = matrices.stream().mapToInt(SeatMatrix::getAllotted).sum();
        if (totalSeats == 0) {
            totalSeats = programmes.stream().mapToInt(Programme::getIntakeCapacity).sum();
        }
        int remainingSeats = Math.max(0, totalSeats - allocatedSeats);

        data.put("totalProgrammes", programmes.size());
        data.put("totalSeats", totalSeats);
        data.put("totalApplications", applications.size());
        data.put("availableSeats", remainingSeats);
        data.put("allocatedSeats", allocatedSeats);
        data.put("remainingSeats", remainingSeats);
        data.put("academicYear", "2026-27");
        data.put("activeRound", 1);

        // Programme-wise breakdown
        Map<String, Object> progBreakdown = new LinkedHashMap<>();
        for (Programme p : programmes) {
            Map<String, Object> item = new LinkedHashMap<>();
            long appCount = applications.stream().filter(a -> a.getProgramme() != null && a.getProgramme().getId().equals(p.getId())).count();
            int progSeats = matrices.stream().filter(m -> m.getProgramme() != null && m.getProgramme().getId().equals(p.getId())).mapToInt(SeatMatrix::getTotalSeats).sum();
            int progAllotted = matrices.stream().filter(m -> m.getProgramme() != null && m.getProgramme().getId().equals(p.getId())).mapToInt(SeatMatrix::getAllotted).sum();
            item.put("code", p.getCode());
            item.put("name", p.getName());
            item.put("department", p.getDepartment());
            item.put("intake", p.getIntakeCapacity());
            item.put("totalSeats", progSeats > 0 ? progSeats : p.getIntakeCapacity());
            item.put("allocatedSeats", progAllotted);
            item.put("availableSeats", Math.max(0, (progSeats > 0 ? progSeats : p.getIntakeCapacity()) - progAllotted));
            item.put("applicationsCount", appCount);
            progBreakdown.put(p.getCode() != null ? p.getCode() : String.valueOf(p.getId()), item);
        }
        data.put("programmes", progBreakdown);

        return ResponseEntity.ok(data);
    }

    // GET /api/dashboard/registrar (Part 16 & Part 20)
    @GetMapping("/registrar")
    public ResponseEntity<Map<String, Object>> getRegistrarMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();

        long totalApps = applicationRepository.count();
        long submitted = applicationRepository.countByStatus(ApplicationStatus.SUBMITTED);
        long verified = applicationRepository.countByStatus(ApplicationStatus.VERIFIED);
        long allotted = applicationRepository.countByStatus(ApplicationStatus.ALLOTTED);
        long joined = applicationRepository.countByStatus(ApplicationStatus.JOINED);
        long cancelled = applicationRepository.countByStatus(ApplicationStatus.CANCELLED);

        long pendingDocs = documentRepository.countByVerificationStatus(com.examly.springapp.entity.VerificationStatus.PENDING);
        long verifiedDocs = documentRepository.countByVerificationStatus(com.examly.springapp.entity.VerificationStatus.VERIFIED);
        long discrepantDocs = documentRepository.countByVerificationStatus(com.examly.springapp.entity.VerificationStatus.DISCREPANT);

        data.put("admissionCycle", "2026-27");
        data.put("currentAdmissionStage", "Document Verification");
        data.put("totalApplications", totalApps);
        data.put("submitted", submitted);
        data.put("pendingVerification", pendingDocs);
        data.put("verified", verifiedDocs);
        data.put("discrepant", discrepantDocs);

        // Stage statuses per Part 16
        data.put("meritListStatus", "Upcoming");
        data.put("counsellingStatus", "Upcoming");
        data.put("seatAllocationStatus", allotted > 0 ? "In Progress" : "Not Started");
        data.put("feeCollectionStatus", joined > 0 ? "In Progress" : "Not Started");
        data.put("admissionConfirmationStatus", joined > 0 ? "In Progress" : "Not Started");

        return ResponseEntity.ok(data);
    }

    // GET /api/dashboard/finance (Part 17 & Part 20)
    @GetMapping("/finance")
    public ResponseEntity<Map<String, Object>> getFinanceMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();

        Double collected = feePaymentRepository.getTotalCollections();
        double totalPaid = collected != null ? collected : 0.0;

        long successfulCount = feePaymentRepository.countByStatus(PaymentStatus.COMPLETED);
        long pendingCount = feePaymentRepository.countByStatus(PaymentStatus.PENDING);
        long failedCount = feePaymentRepository.countByStatus(PaymentStatus.FAILED);

        // Calculate expected dues for allotted and joined candidates
        List<AdmissionApplication> activeOffers = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ALLOTTED || a.getStatus() == ApplicationStatus.JOINED)
                .toList();
        double totalExpectedFee = activeOffers.stream()
                .mapToDouble(a -> {
                    if (a.getProgramme() == null) return 75000.0;
                    double t = a.getProgramme().getTuitionFee() != null ? a.getProgramme().getTuitionFee() : 75000.0;
                    double o = a.getProgramme().getOtherFee() != null ? a.getProgramme().getOtherFee() : 15000.0;
                    return t + o;
                })
                .sum();
        double totalFeesDue = Math.max(0.0, totalExpectedFee - totalPaid);

        data.put("totalFeesDue", totalFeesDue);
        data.put("totalFeesPaid", totalPaid);
        data.put("pendingPayments", pendingCount);
        data.put("successfulPayments", successfulCount);
        data.put("failedPayments", failedCount);
        data.put("academicYear", "2026-27");

        return ResponseEntity.ok(data);
    }

    // GET /api/dashboard/admin (Part 18 & Part 20)
    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();

        var allUsers = userRepository.findAll();
        data.put("totalUsers", allUsers.size());
        data.put("applicants", allUsers.stream().filter(u -> u.getRole() == Role.APPLICANT).count());
        data.put("counsellors", allUsers.stream().filter(u -> u.getRole() == Role.COUNSELLOR).count());
        data.put("programmeCoordinators", allUsers.stream().filter(u -> u.getRole() == Role.PROGRAMME_COORDINATOR || u.getRole() == Role.COORDINATOR).count());
        data.put("registrars", allUsers.stream().filter(u -> u.getRole() == Role.REGISTRAR).count());
        data.put("financeOfficers", allUsers.stream().filter(u -> u.getRole() == Role.FINANCE_OFFICER || u.getRole() == Role.FINANCE).count());
        data.put("administrators", allUsers.stream().filter(u -> u.getRole() == Role.ADMINISTRATOR || u.getRole() == Role.ADMIN).count());

        List<Programme> programmes = programmeRepository.findAll();
        List<SeatMatrix> matrices = seatMatrixRepository.findAll();
        int totalSeats = matrices.stream().mapToInt(SeatMatrix::getTotalSeats).sum();
        if (totalSeats == 0) {
            totalSeats = programmes.stream().mapToInt(Programme::getIntakeCapacity).sum();
        }

        data.put("totalProgrammes", programmes.size());
        data.put("totalSeats", totalSeats);
        data.put("totalApplications", applicationRepository.count());
        data.put("admissionCycle", "2026-27");
        data.put("currentStage", "Document Verification");

        return ResponseEntity.ok(data);
    }
}

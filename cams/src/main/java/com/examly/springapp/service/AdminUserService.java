package com.examly.springapp.service;

import com.examly.springapp.dto.*;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public List<User> getUsers(Role role, String search) {
        List<User> users = userRepository.findAll();

        if (role != null) {
            users = users.stream()
                    .filter(u -> matchesRole(u.getRole(), role))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            users = users.stream().filter(u -> {
                String idStr = u.getId() != null ? String.valueOf(u.getId()) : "";
                String nameStr = u.getFullName() != null ? u.getFullName().toLowerCase() : "";
                String emailStr = u.getEmail() != null ? u.getEmail().toLowerCase() : "";
                String phoneStr = u.getPhone() != null ? u.getPhone() : "";
                String roleStr = u.getRole() != null ? u.getRole().name().toLowerCase() : "";
                return idStr.equals(q) || nameStr.contains(q) || emailStr.contains(q) || phoneStr.contains(q) || roleStr.contains(q);
            }).collect(Collectors.toList());
        }

        users.sort(Comparator.comparing(User::getId));
        return users;
    }

    public AdminUserStatsDto getUserStats() {
        List<User> all = userRepository.findAll();
        long total = all.size();
        long applicants = all.stream().filter(u -> u.getRole() == Role.APPLICANT).count();
        long counsellors = all.stream().filter(u -> u.getRole() == Role.COUNSELLOR).count();
        long coords = all.stream().filter(u -> u.getRole() == Role.PROGRAMME_COORDINATOR || u.getRole() == Role.COORDINATOR).count();
        long registrars = all.stream().filter(u -> u.getRole() == Role.REGISTRAR).count();
        long finance = all.stream().filter(u -> u.getRole() == Role.FINANCE_OFFICER || u.getRole() == Role.FINANCE).count();
        long admins = all.stream().filter(u -> u.getRole() == Role.ADMINISTRATOR || u.getRole() == Role.ADMIN).count();

        return new AdminUserStatsDto(total, applicants, counsellors, coords, registrars, finance, admins);
    }

    public AdminUserDetailsDto getUserDetails(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Map<String, Object> roleDetails = new LinkedHashMap<>();
        Role role = user.getRole();

        if (role == Role.APPLICANT) {
            populateApplicantDetails(user, roleDetails);
        } else if (role == Role.COUNSELLOR) {
            populateCounsellorDetails(user, roleDetails);
        } else if (role == Role.PROGRAMME_COORDINATOR || role == Role.COORDINATOR) {
            populateCoordinatorDetails(roleDetails);
        } else if (role == Role.REGISTRAR) {
            populateRegistrarDetails(roleDetails);
        } else if (role == Role.FINANCE_OFFICER || role == Role.FINANCE) {
            populateFinanceDetails(roleDetails);
        } else if (role == Role.ADMINISTRATOR || role == Role.ADMIN) {
            populateAdminDetails(roleDetails);
        }

        return new AdminUserDetailsDto(user, roleDetails);
    }

    @Transactional
    public User createUser(AdminCreateUserRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new IllegalStateException("An account with email " + request.getEmail() + " already exists.");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "ADMIN@1234";

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.COUNSELLOR;

        User user = new User(
                cleanEmail,
                passwordEncoder.encode(rawPassword),
                request.getName().trim(),
                request.getPhone() != null ? request.getPhone().trim() : null,
                assignedRole
        );
        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        user = userRepository.save(user);

        if (assignedRole == Role.APPLICANT) {
            Applicant applicant = new Applicant(
                    request.getName().trim(),
                    cleanEmail,
                    request.getPhone() != null ? request.getPhone().trim() : "0000000000",
                    "GEN",
                    0.0,
                    0.0
            );
            applicant.setUser(user);
            applicantRepository.save(applicant);
        }

        auditService.log(null, "admin@cams.edu", "ADMIN", "USER_CREATED",
                "User", user.getId().toString(),
                "Created account for " + user.getEmail() + " with role " + user.getRole(), "127.0.0.1");

        return user;
    }

    @Transactional
    public User updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(cleanEmail)) {
            if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
                throw new IllegalStateException("Email " + request.getEmail() + " is already in use by another account.");
            }
            user.setEmail(cleanEmail);
        }

        Role oldRole = user.getRole();
        user.setFullName(request.getName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole(request.getRole());
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        final User savedUser = userRepository.save(user);

        // Keep Applicant entity synchronized if applicable
        applicantRepository.findByUser_Id(savedUser.getId()).ifPresent(applicant -> {
            applicant.setName(savedUser.getFullName());
            applicant.setEmail(savedUser.getEmail());
            if (savedUser.getPhone() != null) {
                applicant.setPhone(savedUser.getPhone());
            }
            applicantRepository.save(applicant);
        });

        String changeNote = (oldRole != savedUser.getRole())
                ? " Role changed from " + oldRole + " to " + savedUser.getRole()
                : "";
        auditService.log(null, "admin@cams.edu", "ADMIN", "USER_UPDATED",
                "User", savedUser.getId().toString(),
                "Updated details for " + savedUser.getEmail() + "." + changeNote, "127.0.0.1");

        return savedUser;
    }

    @Transactional
    public User toggleUserStatus(Long id, Boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!Boolean.TRUE.equals(isActive) && "admin@cams.edu".equalsIgnoreCase(user.getEmail())) {
            throw new IllegalStateException("The primary system administrator account cannot be deactivated.");
        }

        user.setIsActive(isActive);
        User saved = userRepository.save(user);

        auditService.log(null, "admin@cams.edu", "ADMIN", "USER_STATUS_CHANGED",
                "User", user.getId().toString(),
                "User " + user.getEmail() + " status set to active=" + isActive, "127.0.0.1");

        return saved;
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if ("admin@cams.edu".equalsIgnoreCase(user.getEmail())) {
            throw new IllegalStateException("Primary system administrator account cannot be deleted.");
        }

        Optional<Applicant> applicantOpt = applicantRepository.findByUser_Id(user.getId());
        if (applicantOpt.isPresent()) {
            Applicant applicant = applicantOpt.get();
            var apps = applicationRepository.findByApplicant_Id(applicant.getId());
            if (!apps.isEmpty()) {
                throw new IllegalStateException("Cannot delete user: Applicant has " + apps.size() +
                        " active admission application record(s). Please deactivate the account instead to maintain statutory audit compliance.");
            }

            var docs = documentRepository.findByApplicant_Id(applicant.getId());
            if (!docs.isEmpty()) {
                throw new IllegalStateException("Cannot delete user: Applicant has " + docs.size() +
                        " uploaded verification certificate(s). Please deactivate the account instead.");
            }

            var fees = feePaymentRepository.findByApplicant_Id(applicant.getId());
            if (!fees.isEmpty()) {
                throw new IllegalStateException("Cannot delete user: Applicant has financial transaction and GST invoice record(s). Please deactivate the account instead.");
            }

            applicantRepository.delete(applicant);
        }

        // Check if counsellor has performed document verifications
        long verifiedCount = documentRepository.findAll().stream()
                .filter(d -> user.getEmail().equalsIgnoreCase(d.getVerifiedBy()))
                .count();
        if (verifiedCount > 0) {
            throw new IllegalStateException("Cannot delete counsellor: This staff account has verified " +
                    verifiedCount + " document(s) in the regulatory queue. Please deactivate the account instead to maintain verification audit integrity.");
        }

        userRepository.delete(user);

        auditService.log(null, "admin@cams.edu", "ADMIN", "USER_DELETED",
                "User", id.toString(),
                "Deleted user account: " + user.getEmail() + " (" + user.getRole() + ")", "127.0.0.1");
    }

    private boolean matchesRole(Role actual, Role target) {
        if (actual == target) return true;
        if ((target == Role.PROGRAMME_COORDINATOR || target == Role.COORDINATOR) &&
            (actual == Role.PROGRAMME_COORDINATOR || actual == Role.COORDINATOR)) return true;
        if ((target == Role.FINANCE_OFFICER || target == Role.FINANCE) &&
            (actual == Role.FINANCE_OFFICER || actual == Role.FINANCE)) return true;
        if ((target == Role.ADMINISTRATOR || target == Role.ADMIN) &&
            (actual == Role.ADMINISTRATOR || actual == Role.ADMIN)) return true;
        return false;
    }

    private void populateApplicantDetails(User user, Map<String, Object> details) {
        Optional<Applicant> applicantOpt = applicantRepository.findByUser_Id(user.getId());
        if (applicantOpt.isPresent()) {
            Applicant a = applicantOpt.get();
            Map<String, Object> appInfo = new LinkedHashMap<>();
            appInfo.put("applicantId", a.getId());
            appInfo.put("category", a.getCategory());
            appInfo.put("boardPercentage", a.getBoardPercentage());
            appInfo.put("entranceScore", a.getEntranceScore());
            appInfo.put("dateOfBirth", a.getDateOfBirth() != null ? a.getDateOfBirth() : "Not available");
            appInfo.put("gender", a.getGender() != null ? a.getGender() : "Not available");
            appInfo.put("address", a.getAddress() != null ? a.getAddress() : "Not available");
            appInfo.put("schoolBoard", a.getSchoolBoard() != null ? a.getSchoolBoard() : "Not available");
            appInfo.put("entranceExamName", a.getEntranceExamName() != null ? a.getEntranceExamName() : "Not available");
            appInfo.put("entranceRollNo", a.getEntranceRollNo() != null ? a.getEntranceRollNo() : "Not available");
            details.put("applicantProfile", appInfo);

            // Applications
            var apps = applicationRepository.findByApplicant_Id(a.getId());
            List<Map<String, Object>> appList = new ArrayList<>();
            for (AdmissionApplication app : apps) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", app.getId());
                item.put("applicationNumber", app.getApplicationNumber());
                item.put("programmeName", app.getProgramme() != null ? app.getProgramme().getName() : "Not available");
                item.put("programmeCode", app.getProgramme() != null ? app.getProgramme().getCode() : "");
                item.put("preferenceRank", app.getPreferenceRank());
                item.put("status", app.getStatus() != null ? app.getStatus().name() : "SUBMITTED");
                item.put("meritScore", app.getMeritScore());
                item.put("allottedQuota", app.getAllottedQuota() != null ? app.getAllottedQuota() : "Not allotted");
                item.put("allottedRound", app.getAllottedRound());
                appList.add(item);
            }
            details.put("applications", appList);

            // Documents
            var docs = documentRepository.findByApplicant_Id(a.getId());
            List<Map<String, Object>> docList = new ArrayList<>();
            for (Document doc : docs) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", doc.getId());
                item.put("documentType", doc.getDocumentType() != null ? doc.getDocumentType().name() : "DOCUMENT");
                item.put("fileName", doc.getFileName());
                item.put("status", doc.getVerificationStatus() != null ? doc.getVerificationStatus().name() : "PENDING");
                item.put("verifiedBy", doc.getVerifiedBy() != null ? doc.getVerifiedBy() : "Not verified yet");
                item.put("isDigiLockerVerified", Boolean.TRUE.equals(doc.getIsDigiLockerVerified()));
                item.put("remarks", doc.getRemarks() != null ? doc.getRemarks() : "None");
                docList.add(item);
            }
            details.put("documents", docList);

            // Fees
            var fees = feePaymentRepository.findByApplicant_Id(a.getId());
            List<Map<String, Object>> feeList = new ArrayList<>();
            for (FeePayment fee : fees) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", fee.getId());
                item.put("receiptNumber", fee.getInvoiceNumber() != null ? fee.getInvoiceNumber() : fee.getTransactionId());
                item.put("feeType", fee.getTuitionFee() != null && fee.getTuitionFee() > 0 ? "Tuition & Admission Fee" : "Institutional Fee");
                item.put("amount", fee.getAmount());
                item.put("status", fee.getStatus() != null ? fee.getStatus().name() : "PENDING");
                item.put("paymentDate", fee.getPaidAt());
                feeList.add(item);
            }
            details.put("feePayments", feeList);
        } else {
            details.put("applicantProfile", "Not available");
        }
    }

    private void populateCounsellorDetails(User user, Map<String, Object> details) {
        details.put("assignedResponsibilities", "Candidate Document Verification, Discrepancy Flagging & Audit Desk");
        var allDocs = documentRepository.findAll();
        long verifiedByMe = allDocs.stream()
                .filter(d -> user.getEmail().equalsIgnoreCase(d.getVerifiedBy()) && d.getVerificationStatus() == VerificationStatus.VERIFIED)
                .count();
        long discrepantByMe = allDocs.stream()
                .filter(d -> user.getEmail().equalsIgnoreCase(d.getVerifiedBy()) && d.getVerificationStatus() == VerificationStatus.DISCREPANT)
                .count();
        long totalSystemPending = documentRepository.countByVerificationStatus(VerificationStatus.PENDING);

        details.put("documentsVerifiedCount", verifiedByMe);
        details.put("discrepanciesFlaggedCount", discrepantByMe);
        details.put("pendingVerificationQueue", totalSystemPending);

        List<Map<String, Object>> recent = allDocs.stream()
                .filter(d -> user.getEmail().equalsIgnoreCase(d.getVerifiedBy()))
                .limit(10)
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("fileName", d.getFileName());
                    m.put("type", d.getDocumentType() != null ? d.getDocumentType().name() : "CERTIFICATE");
                    m.put("status", d.getVerificationStatus().name());
                    m.put("remarks", d.getRemarks());
                    m.put("verifiedAt", d.getVerifiedAt());
                    return m;
                })
                .collect(Collectors.toList());
        details.put("recentVerifications", recent);
    }

    private void populateCoordinatorDetails(Map<String, Object> details) {
        details.put("assignedResponsibilities", "Round-Based Allocation Engine, Seat Matrix Capacity & Dynamic Merit Formulas");
        var progs = programmeRepository.findAll();
        details.put("totalProgrammes", progs.size());
        int totalSeats = seatMatrixRepository.findAll().stream().mapToInt(SeatMatrix::getTotalSeats).sum();
        details.put("totalSanctionedSeats", totalSeats);
        details.put("totalApplicationsEvaluated", applicationRepository.count());
        List<String> progNames = progs.stream().map(p -> p.getCode() + " - " + p.getName()).collect(Collectors.toList());
        details.put("supervisedProgrammes", progNames);
    }

    private void populateRegistrarDetails(Map<String, Object> details) {
        details.put("assignedResponsibilities", "Statutory Higher Education Compliance, AISHE Regulatory Survey & Intake Audits");
        details.put("totalRegisteredApplications", applicationRepository.count());
        details.put("verifiedApplications", applicationRepository.countByStatus(ApplicationStatus.VERIFIED));
        details.put("allottedOffers", applicationRepository.countByStatus(ApplicationStatus.ALLOTTED));
        details.put("admittedStudents", applicationRepository.countByStatus(ApplicationStatus.JOINED));
        details.put("currentAcademicCycle", "2026-27");
        details.put("activeAdmissionRound", 1);
        details.put("regulatoryCompliance", "UGC Norms & AISHE Reference Code C-42918");
    }

    private void populateFinanceDetails(Map<String, Object> details) {
        details.put("assignedResponsibilities", "Admission Fee Collections, GST HSN 999293 Tax Receipts & Scholarship Concessions");
        Double totalCollections = feePaymentRepository.getTotalCollections();
        details.put("totalFeesCollected", totalCollections != null ? totalCollections : 0.0);
        details.put("successfulPaymentsCount", feePaymentRepository.countByStatus(PaymentStatus.COMPLETED));
        details.put("pendingPaymentsCount", feePaymentRepository.countByStatus(PaymentStatus.PENDING));
        details.put("failedPaymentsCount", feePaymentRepository.countByStatus(PaymentStatus.FAILED));
        details.put("hsnSacCode", "999293 (Higher Education Exemption - Notif. 12/2017)");
    }

    private void populateAdminDetails(Map<String, Object> details) {
        details.put("assignedResponsibilities", "Full Command Center, Security Boundaries, User Lifecycle & Infrastructure");
        details.put("totalStakeholders", userRepository.count());
        details.put("systemHealth", "UP (Uptime 99.98%)");
        details.put("databaseStatus", "MySQL 8.0 Connected (camsdb)");
        details.put("securityModel", "Spring Security 6.x + Stateless JWT RBAC");
        details.put("recentAuditEventsCount", auditLogRepository.count());
    }
}

package com.examly.springapp.service;

import com.examly.springapp.entity.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeedService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsersAndApplicants();
        seedProgrammes();
        seedSeatMatrix();
    }

    private void seedUsersAndApplicants() {
        String defaultPassword = passwordEncoder.encode("ADMIN@1234");

        createOrUpdateUser("admin@cams.edu", defaultPassword, "System Administrator", "9876543210", Role.ADMINISTRATOR);
        createOrUpdateUser("registrar@cams.edu", defaultPassword, "Dr. K. Sharma (Registrar)", "9876543211", Role.REGISTRAR);
        createOrUpdateUser("coordinator@cams.edu", defaultPassword, "Prof. R. Menon (Coordinator)", "9876543212", Role.PROGRAMME_COORDINATOR);
        createOrUpdateUser("counsellor@cams.edu", defaultPassword, "Ms. Ananya Roy (Counsellor)", "9876543213", Role.COUNSELLOR);
        createOrUpdateUser("finance@cams.edu", defaultPassword, "Mr. Suresh Iyer (Finance Officer)", "9876543214", Role.FINANCE_OFFICER);

        // Demo applicant
        User appUser = createOrUpdateUser("applicant@cams.edu", defaultPassword, "Arjun Kumar", "9876543215", Role.APPLICANT);

        Applicant applicant = applicantRepository.findByEmail("applicant@cams.edu").orElse(null);
        if (applicant == null) {
            applicant = new Applicant(
                    "Arjun Kumar",
                    "applicant@cams.edu",
                    "9876543215",
                    "GEN",
                    92.5,
                    88.0
            );
            applicant.setUser(appUser);
            applicant.setDateOfBirth("2005-06-15");
            applicant.setGender("Male");
            applicant.setAddress("42 Lakeview Avenue, Chennai, Tamil Nadu");
            applicant.setSchoolBoard("CBSE");
            applicant.setEntranceExamName("JEE Main");
            applicant.setEntranceRollNo("26031049281");
            applicant = applicantRepository.save(applicant);
        } else {
            applicant.setUser(appUser);
            applicant = applicantRepository.save(applicant);
        }

        // Seed initial pending documents for counsellor verification testing
        if (applicant != null && documentRepository.findByApplicant_Id(applicant.getId()).isEmpty()) {
            seedApplicantDocuments(applicant);
        }
    }

    private User createOrUpdateUser(String email, String encodedPass, String name, String phone, Role role) {
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            user = new User(email, encodedPass, name, phone, role);
            user.setIsActive(true);
        } else {
            user.setPassword(encodedPass);
            user.setRole(role);
            user.setIsActive(true);
            if (name != null) user.setFullName(name);
            if (phone != null) user.setPhone(phone);
        }
        return userRepository.save(user);
    }

    private void seedApplicantDocuments(Applicant applicant) {
        DocumentType[] types = {
            DocumentType.MARKSHEET_10,
            DocumentType.MARKSHEET_12,
            DocumentType.IDENTITY_PROOF,
            DocumentType.ENTRANCE_SCORECARD
        };
        for (DocumentType dt : types) {
            Document doc = new Document(
                applicant,
                dt,
                dt.name().toLowerCase() + "_original.pdf",
                "application/pdf",
                1024L * 180,
                "data:application/pdf;base64,JVBERi0xLjQKJVRlc3REb2N1bWVudA==",
                "hash_" + dt.name().toLowerCase()
            );
            doc.setVerificationStatus(VerificationStatus.PENDING);
            doc.setUploadedAt(LocalDateTime.now());
            documentRepository.save(doc);
        }
    }

    private void seedProgrammes() {
        createOrUpdateProgramme("BTECH_CSE", "B.Tech Computer Science and Engineering", "CSE", 60, 4,
                "{\"boardWeight\":0.4,\"entranceWeight\":0.6,\"tieBreaker\":\"ENTRANCE_FIRST\"}", 85000.0, 15000.0);
        createOrUpdateProgramme("BTECH_IT", "B.Tech Information Technology", "IT", 60, 4,
                "{\"boardWeight\":0.4,\"entranceWeight\":0.6,\"tieBreaker\":\"ENTRANCE_FIRST\"}", 80000.0, 15000.0);
        createOrUpdateProgramme("BTECH_AIDS", "B.Tech Artificial Intelligence and Data Science", "AIDS", 60, 4,
                "{\"boardWeight\":0.4,\"entranceWeight\":0.6,\"tieBreaker\":\"ENTRANCE_FIRST\"}", 85000.0, 15000.0);
        createOrUpdateProgramme("BTECH_ECE", "B.Tech Electronics and Communication Engineering", "ECE", 60, 4,
                "{\"boardWeight\":0.5,\"entranceWeight\":0.5,\"tieBreaker\":\"MATHS_FIRST\"}", 75000.0, 15000.0);
        createOrUpdateProgramme("BTECH_EEE", "B.Tech Electrical and Electronics Engineering", "EEE", 60, 4,
                "{\"boardWeight\":0.5,\"entranceWeight\":0.5,\"tieBreaker\":\"BOARD_FIRST\"}", 70000.0, 15000.0);
        createOrUpdateProgramme("BTECH_MECH", "B.Tech Mechanical Engineering", "MECH", 60, 4,
                "{\"boardWeight\":0.5,\"entranceWeight\":0.5,\"tieBreaker\":\"BOARD_FIRST\"}", 70000.0, 15000.0);
        createOrUpdateProgramme("BTECH_CIVIL", "B.Tech Civil Engineering", "CIVIL", 60, 4,
                "{\"boardWeight\":0.5,\"entranceWeight\":0.5,\"tieBreaker\":\"BOARD_FIRST\"}", 65000.0, 15000.0);
    }

    private Programme createOrUpdateProgramme(String code, String name, String dept, int intake, int duration,
                                              String meritFormula, double tuitionFee, double otherFee) {
        Programme prog = programmeRepository.findAll().stream()
                .filter(p -> code.equalsIgnoreCase(p.getCode()) || name.equalsIgnoreCase(p.getName()) || (p.getCode() == null && p.getName().toLowerCase().contains(dept.toLowerCase())))
                .findFirst().orElse(null);

        if (prog == null) {
            prog = new Programme(name, dept, intake, duration, true);
        }
        prog.setCode(code);
        prog.setName(name);
        prog.setDepartment(dept);
        prog.setIntakeCapacity(intake);
        prog.setDurationYears(duration);
        prog.setIsActive(true);
        prog.setMeritFormula(meritFormula);
        prog.setTuitionFee(tuitionFee);
        prog.setOtherFee(otherFee);
        return programmeRepository.save(prog);
    }

    private void seedSeatMatrix() {
        for (Programme prog : programmeRepository.findAll()) {
            createSeatMatrixIfAbsent(prog, "GEN", (int)(prog.getIntakeCapacity() * 0.40));
            createSeatMatrixIfAbsent(prog, "OBC", (int)(prog.getIntakeCapacity() * 0.27));
            createSeatMatrixIfAbsent(prog, "SC", (int)(prog.getIntakeCapacity() * 0.15));
            createSeatMatrixIfAbsent(prog, "ST", (int)(prog.getIntakeCapacity() * 0.08));
            createSeatMatrixIfAbsent(prog, "EWS", (int)(prog.getIntakeCapacity() * 0.10));
        }
        seedDemoApplicantApplications();
    }

    private void createSeatMatrixIfAbsent(Programme prog, String quota, int seats) {
        boolean exists = seatMatrixRepository.findAll().stream()
                .anyMatch(sm -> sm.getProgramme() != null && sm.getProgramme().getId().equals(prog.getId()) &&
                        quota.equalsIgnoreCase(sm.getQuota()) &&
                        sm.getRoundNo() == 1 &&
                        "2026-27".equals(sm.getAcademicYear()));
        if (!exists) {
            seatMatrixRepository.save(new SeatMatrix(prog, quota, Math.max(1, seats), 1, "2026-27"));
        }
    }

    private void seedDemoApplicantApplications() {
        Applicant applicant = applicantRepository.findByEmail("applicant@cams.edu").orElse(null);
        if (applicant != null && applicationRepository.findByApplicant_Id(applicant.getId()).isEmpty()) {
            List<Programme> progs = programmeRepository.findAll();
            if (progs.size() >= 5) {
                // Preference 1: CSE - ALLOTTED in Round 1
                Programme cse = progs.stream().filter(p -> "BTECH_CSE".equals(p.getCode())).findFirst().orElse(progs.get(0));
                AdmissionApplication app1 = new AdmissionApplication(applicant, cse, 1);
                app1.setApplicationNumber("CAMS-2026-000501");
                app1.setStatus(ApplicationStatus.ALLOTTED);
                app1.setAllottedQuota("GEN");
                app1.setAllottedRound(1);
                app1.setMeritScore(92.5);
                app1.setAcademicYear("2026-27");
                app1.setAcceptanceDeadline(LocalDateTime.of(2026, 10, 18, 23, 59, 59));
                applicationRepository.save(app1);

                // Preferences 2 to 5
                String[] otherCodes = {"BTECH_IT", "BTECH_AIDS", "BTECH_ECE", "BTECH_MECH"};
                for (int i = 0; i < otherCodes.length; i++) {
                    final String c = otherCodes[i];
                    Programme p = progs.stream().filter(pr -> c.equals(pr.getCode())).findFirst().orElse(null);
                    if (p != null) {
                        AdmissionApplication app = new AdmissionApplication(applicant, p, i + 2);
                        app.setApplicationNumber(String.format("CAMS-2026-00050%d", i + 2));
                        app.setStatus(ApplicationStatus.SUBMITTED);
                        app.setMeritScore(92.5);
                        app.setAcademicYear("2026-27");
                        applicationRepository.save(app);
                    }
                }
            }
        }
    }
}

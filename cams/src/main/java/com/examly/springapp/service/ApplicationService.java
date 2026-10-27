package com.examly.springapp.service;

import com.examly.springapp.dto.ApplicationResponseDto;
import com.examly.springapp.dto.ApplicationSubmissionDto;
import com.examly.springapp.dto.MeritCandidateDto;
import com.examly.springapp.dto.StatusResponseDto;
import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.Applicant;
import com.examly.springapp.entity.ApplicationStatus;
import com.examly.springapp.entity.Programme;
import com.examly.springapp.exception.DuplicateApplicationException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.AdmissionApplicationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private ProgrammeService programmeService;

    @Autowired
    private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // FR4 + FR11: Single preference submission maintaining backward compatibility
    @Transactional
    public AdmissionApplication submitApplication(Long applicantId, Long programmeId, Integer preferenceRank) {
        Applicant applicant = applicantService.getApplicantById(applicantId);
        Programme programme = programmeService.getProgrammeById(programmeId);

        // Aadhaar duplicate check per SRS FR4 / FR11
        if (applicant.getAadhaarHash() != null &&
                applicationRepository.existsByApplicant_AadhaarHashAndAcademicYear(applicant.getAadhaarHash(), "2026-27")) {
            throw new DuplicateApplicationException("An application already exists for this Aadhaar");
        }

        if (applicationRepository.existsByApplicant_IdAndProgramme_Id(applicantId, programmeId)) {
            throw new DuplicateApplicationException(
                    "An application already exists for this applicant in this programme");
        }

        AdmissionApplication application = new AdmissionApplication(applicant, programme, preferenceRank);
        application.setApplicationNumber(generateApplicationNumber(applicantId, programmeId));
        application.setMeritScore(calculateMeritScore(applicant, programme));
        AdmissionApplication saved = applicationRepository.save(application);

        if (applicant.getUser() != null) {
            notificationService.sendNotification(
                    applicant.getUser(),
                    "Application Submitted",
                    "Your application (" + saved.getApplicationNumber() + ") for " + programme.getName() + " has been successfully submitted.",
                    "APPLICATION"
            );
        }

        return saved;
    }

    // FR4: Multi-preference application submission (up to 5 ranked choices)
    @Transactional
    public List<AdmissionApplication> submitMultiPreferenceApplication(ApplicationSubmissionDto dto) {
        Applicant applicant = applicantService.getApplicantById(dto.getApplicantId());

        List<AdmissionApplication> existingApps = applicationRepository.findByApplicant_Id(applicant.getId());

        if (applicant.getAadhaarHash() != null && existingApps.isEmpty() &&
                applicationRepository.existsByApplicant_AadhaarHashAndAcademicYear(applicant.getAadhaarHash(), dto.getAcademicYear())) {
            throw new DuplicateApplicationException("An application already exists for this Aadhaar");
        }

        List<Long> programmeIds = dto.getProgrammeIds();
        if (programmeIds == null || programmeIds.isEmpty() || programmeIds.size() > 5) {
            throw new IllegalArgumentException("Between 1 and 5 programme preferences are supported");
        }

        // Check for duplicates within preference list
        Set<Long> uniqueIds = new HashSet<>(programmeIds);
        if (uniqueIds.size() < programmeIds.size()) {
            throw new IllegalArgumentException("Duplicate programmes in preference list are not allowed");
        }

        // Allow editing/updating preferences: remove previous SUBMITTED preferences
        List<AdmissionApplication> subApps = existingApps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED)
                .collect(Collectors.toList());
        if (!subApps.isEmpty()) {
            applicationRepository.deleteAll(subApps);
            applicationRepository.flush();
        }

        List<AdmissionApplication> savedApplications = new ArrayList<>();
        for (int i = 0; i < programmeIds.size(); i++) {
            Long progId = programmeIds.get(i);
            int rank = i + 1;

            if (applicationRepository.existsByApplicant_IdAndProgramme_Id(applicant.getId(), progId)) {
                throw new DuplicateApplicationException(
                        "An application already exists for this applicant in this programme");
            }

            Programme programme = programmeService.getProgrammeById(progId);
            AdmissionApplication app = new AdmissionApplication(applicant, programme, rank);
            app.setAcademicYear(dto.getAcademicYear());
            app.setApplicationNumber(generateApplicationNumber(applicant.getId(), progId));
            app.setMeritScore(calculateMeritScore(applicant, programme));
            app.setStatus(ApplicationStatus.SUBMITTED);

            savedApplications.add(applicationRepository.save(app));
        }

        if (applicant.getUser() != null && !savedApplications.isEmpty()) {
            notificationService.sendNotification(
                    applicant.getUser(),
                    "Admission Application Submitted",
                    "Your college admission application has been submitted successfully with " + savedApplications.size() + " preferences. Application Ref: " + savedApplications.get(0).getApplicationNumber(),
                    "APPLICATION"
            );
        }

        return savedApplications;
    }

    public List<AdmissionApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public AdmissionApplication getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

    public List<AdmissionApplication> getApplicationsByApplicant(Long applicantId) {
        return applicationRepository.findByApplicant_Id(applicantId);
    }

    public AdmissionApplication updateStatus(Long id, ApplicationStatus status) {
        AdmissionApplication application = getApplicationById(id);
        application.setStatus(status);
        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        AdmissionApplication application = getApplicationById(id);
        applicationRepository.delete(application);
    }

    // FR5: Configurable merit calculation per programme based on JSON formula
    public double calculateMeritScore(Applicant applicant, Programme programme) {
        double board = applicant.getBoardPercentage() != null ? applicant.getBoardPercentage() : 0.0;
        double entrance = applicant.getEntranceScore() != null ? applicant.getEntranceScore() : 0.0;

        double boardWeight = 0.4;
        double entranceWeight = 0.6;

        if (programme.getMeritFormula() != null && !programme.getMeritFormula().isBlank()) {
            try {
                JsonNode root = objectMapper.readTree(programme.getMeritFormula());
                if (root.has("boardWeight")) {
                    boardWeight = root.get("boardWeight").asDouble();
                }
                if (root.has("entranceWeight")) {
                    entranceWeight = root.get("entranceWeight").asDouble();
                }
            } catch (Exception ignored) {
                // fallback to 0.4 / 0.6
            }
        }

        return Math.round(((board * boardWeight) + (entrance * entranceWeight)) * 100.0) / 100.0;
    }

    // Backward compatible combinedScore calling dynamic formula
    public double combinedScore(AdmissionApplication application) {
        return calculateMeritScore(application.getApplicant(), application.getProgramme());
    }

    // FR5: Merit list for a programme with ranking
    public List<AdmissionApplication> getMeritList(Long programmeId) {
        List<AdmissionApplication> applications = applicationRepository.findByProgramme_Id(programmeId);
        List<AdmissionApplication> sorted = applications.stream()
                .sorted(Comparator.comparingDouble(this::combinedScore).reversed())
                .collect(Collectors.toList());

        for (int i = 0; i < sorted.size(); i++) {
            sorted.get(i).setMeritRank(i + 1);
            sorted.get(i).setMeritScore(combinedScore(sorted.get(i)));
        }

        return sorted;
    }

    // FR5: Category-specific merit list
    public List<AdmissionApplication> getMeritListByCategory(Long programmeId, String category) {
        List<AdmissionApplication> applications =
                applicationRepository.findByProgramme_IdAndApplicant_Category(programmeId, category);

        List<AdmissionApplication> sorted = applications.stream()
                .sorted(Comparator.comparingDouble(this::combinedScore).reversed())
                .collect(Collectors.toList());

        for (int i = 0; i < sorted.size(); i++) {
            sorted.get(i).setCategoryRank(i + 1);
            sorted.get(i).setMeritScore(combinedScore(sorted.get(i)));
        }

        return sorted;
    }

    // DTO-formatted merit list for UI
    public List<MeritCandidateDto> getDetailedMeritList(Long programmeId, String category) {
        List<AdmissionApplication> list = (category != null && !category.isBlank())
                ? getMeritListByCategory(programmeId, category)
                : getMeritList(programmeId);

        List<MeritCandidateDto> dtos = new ArrayList<>();
        for (int i = 0; i < list.size(); i++) {
            AdmissionApplication app = list.get(i);
            MeritCandidateDto dto = new MeritCandidateDto();
            dto.setRank(i + 1);
            dto.setCategoryRank(app.getCategoryRank() != null ? app.getCategoryRank() : i + 1);
            dto.setApplicationId(app.getId());
            dto.setApplicationNumber(app.getApplicationNumber());
            dto.setApplicantId(app.getApplicant().getId());
            dto.setApplicantName(app.getApplicant().getName());
            dto.setCategory(app.getApplicant().getCategory());
            dto.setBoardPercentage(app.getApplicant().getBoardPercentage());
            dto.setEntranceScore(app.getApplicant().getEntranceScore());
            dto.setMeritScore(combinedScore(app));
            dto.setPreferenceRank(app.getPreferenceRank());
            dto.setStatus(app.getStatus());
            dto.setProgrammeId(app.getProgramme().getId());
            dto.setProgrammeName(app.getProgramme().getName());
            dtos.add(dto);
        }
        return dtos;
    }

    // Timeline tracker (SRS Section 3.1.1 & FR4)
    public StatusResponseDto getStatusTimeline(String identifier) {
        AdmissionApplication app = null;

        if (identifier.startsWith("CAMS-")) {
            app = applicationRepository.findByApplicationNumber(identifier).orElse(null);
        } else {
            try {
                Long id = Long.parseLong(identifier);
                app = applicationRepository.findById(id).orElse(null);
            } catch (NumberFormatException ignored) {}
        }

        if (app == null) {
            // Try applicant ID or email
            List<AdmissionApplication> byApplicant = applicationRepository.findAll().stream()
                    .filter(a -> a.getApplicant().getEmail().equalsIgnoreCase(identifier))
                    .collect(Collectors.toList());
            if (!byApplicant.isEmpty()) {
                app = byApplicant.get(0);
            }
        }

        if (app == null) {
            throw new ResourceNotFoundException("Application status not found for identifier: " + identifier);
        }

        StatusResponseDto dto = new StatusResponseDto();
        dto.setApplicationNumber(app.getApplicationNumber());
        dto.setApplicantName(app.getApplicant().getName());
        dto.setEmail(app.getApplicant().getEmail());
        dto.setCurrentStatus(app.getStatus());
        dto.setAcademicYear(app.getAcademicYear());
        dto.setAppliedDate(app.getAppliedDate());

        List<AdmissionApplication> allPrefs = applicationRepository.findByApplicant_Id(app.getApplicant().getId());
        dto.setPreferences(allPrefs.stream().map(this::mapToResponseDto).collect(Collectors.toList()));

        Optional<AdmissionApplication> allottedOpt = allPrefs.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ALLOTTED || a.getStatus() == ApplicationStatus.JOINED)
                .findFirst();

        if (allottedOpt.isPresent()) {
            AdmissionApplication allotted = allottedOpt.get();
            dto.setIsAllotted(true);
            dto.setAllottedProgramme(allotted.getProgramme().getName());
            dto.setAllottedQuota(allotted.getAllottedQuota());
            dto.setAllottedRound(allotted.getAllottedRound());
            dto.setAcceptanceDeadline(allotted.getAcceptanceDeadline());
            dto.setUpgradeRequested(allotted.getUpgradeRequested());
        } else {
            dto.setIsAllotted(false);
        }

        dto.setDocumentVerificationStatus(app.getStatus() == ApplicationStatus.VERIFIED ? "VERIFIED" : "PENDING");
        dto.setFeeStatus(app.getStatus() == ApplicationStatus.JOINED ? "COMPLETED" : "PENDING");

        return dto;
    }

    public ApplicationResponseDto mapToResponseDto(AdmissionApplication app) {
        ApplicationResponseDto dto = new ApplicationResponseDto();
        dto.setId(app.getId());
        dto.setApplicationNumber(app.getApplicationNumber());
        dto.setApplicantId(app.getApplicant().getId());
        dto.setApplicantName(app.getApplicant().getName());
        dto.setApplicantEmail(app.getApplicant().getEmail());
        dto.setApplicantPhone(app.getApplicant().getPhone());
        dto.setCategory(app.getApplicant().getCategory());
        dto.setBoardPercentage(app.getApplicant().getBoardPercentage());
        dto.setEntranceScore(app.getApplicant().getEntranceScore());
        dto.setProgrammeId(app.getProgramme().getId());
        dto.setProgrammeName(app.getProgramme().getName());
        dto.setDepartment(app.getProgramme().getDepartment());
        dto.setPreferenceRank(app.getPreferenceRank());
        dto.setStatus(app.getStatus());
        dto.setAppliedDate(app.getAppliedDate());
        dto.setAcademicYear(app.getAcademicYear());
        dto.setUpgradeRequested(app.getUpgradeRequested());
        dto.setAllottedQuota(app.getAllottedQuota());
        dto.setAllottedRound(app.getAllottedRound());
        dto.setAcceptanceDeadline(app.getAcceptanceDeadline());
        dto.setMeritScore(app.getMeritScore() != null ? app.getMeritScore() : combinedScore(app));
        dto.setMeritRank(app.getMeritRank());
        dto.setCategoryRank(app.getCategoryRank());
        return dto;
    }

    private String generateApplicationNumber(Long applicantId, Long programmeId) {
        return String.format("CAMS-2026-%04d%02d", applicantId, programmeId);
    }
}

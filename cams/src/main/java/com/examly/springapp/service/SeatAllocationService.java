package com.examly.springapp.service;

import com.examly.springapp.dto.AllocationResultDto;
import com.examly.springapp.dto.ApplicationResponseDto;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.exception.SeatConflictException;
import com.examly.springapp.repository.AdmissionApplicationRepository;
import com.examly.springapp.repository.SeatMatrixRepository;
import com.examly.springapp.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SeatAllocationService {

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private WaitlistRepository waitlistRepository;

    @Autowired
    private NotificationService notificationService;

    // FR6: Seat Allocation with SELECT FOR UPDATE pessimistic concurrency protection
    @Transactional
    public List<AdmissionApplication> allocateSeats(Long seatMatrixId) {
        // SELECT FOR UPDATE locking query
        SeatMatrix seatMatrix = seatMatrixRepository.findByIdForUpdate(seatMatrixId)
                .orElseThrow(() -> new SeatConflictException("Seat matrix row not found with id: " + seatMatrixId));

        if (!seatMatrix.hasVacancy()) {
            throw new SeatConflictException(
                    "No vacancy left in this seat matrix row (programme + quota + round already full)");
        }

        // Merit-ranked applicants of this programme for this quota
        List<AdmissionApplication> meritList = applicationService.getMeritListByCategory(
                seatMatrix.getProgramme().getId(), seatMatrix.getQuota());

        int newlyAllotted = 0;
        int waitlistPos = 1;

        for (AdmissionApplication application : meritList) {
            // Check if applicant already holds an active seat elsewhere
            boolean holdsActiveSeatElsewhere = applicantHoldsActiveSeatElsewhere(
                    application.getApplicant().getId(), application.getId());

            if (seatMatrix.hasVacancy()) {
                if ((application.getStatus() == ApplicationStatus.SUBMITTED
                        || application.getStatus() == ApplicationStatus.VERIFIED)
                        && !holdsActiveSeatElsewhere) {

                    application.setStatus(ApplicationStatus.ALLOTTED);
                    application.setAllottedQuota(seatMatrix.getQuota());
                    application.setAllottedRound(seatMatrix.getRoundNo());
                    // 72-hour seat acceptance deadline per SRS FR6
                    application.setAcceptanceDeadline(LocalDateTime.now().plusHours(72));
                    applicationRepository.save(application);

                    seatMatrix.setAllotted(seatMatrix.getAllotted() + 1);
                    newlyAllotted++;

                    // Send allotment notification
                    if (application.getApplicant().getUser() != null) {
                        notificationService.sendNotification(
                                application.getApplicant().getUser(),
                                "Seat Allotted!",
                                "Congratulations! You have been allotted a seat in " + seatMatrix.getProgramme().getName() + " under " + seatMatrix.getQuota() + " quota in Round " + seatMatrix.getRoundNo() + ". Please confirm within 72 hours.",
                                "ALLOTMENT"
                        );
                    }
                }
            } else {
                // Seats exhausted: candidate enters waitlist (SRS FR6)
                if (application.getStatus() == ApplicationStatus.SUBMITTED
                        || application.getStatus() == ApplicationStatus.VERIFIED) {
                    addCandidateToWaitlist(application, seatMatrix, waitlistPos++);
                }
            }
        }

        seatMatrixRepository.save(seatMatrix);
        return meritList;
    }

    // Extended allocation runner returning full allocation statistics
    @Transactional
    public AllocationResultDto runAllocationWithStats(Long seatMatrixId) {
        SeatMatrix seatMatrix = seatMatrixRepository.findByIdForUpdate(seatMatrixId)
                .orElseThrow(() -> new SeatConflictException("Seat matrix row not found with id: " + seatMatrixId));

        int previousAllotted = seatMatrix.getAllotted();
        List<AdmissionApplication> list = allocateSeats(seatMatrixId);

        List<ApplicationResponseDto> newlyAllotted = list.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ALLOTTED &&
                        seatMatrix.getQuota().equalsIgnoreCase(a.getAllottedQuota()))
                .map(applicationService::mapToResponseDto)
                .collect(Collectors.toList());

        AllocationResultDto result = new AllocationResultDto();
        result.setSeatMatrixId(seatMatrix.getId());
        result.setProgrammeId(seatMatrix.getProgramme().getId());
        result.setProgrammeName(seatMatrix.getProgramme().getName());
        result.setQuota(seatMatrix.getQuota());
        result.setRoundNo(seatMatrix.getRoundNo());
        result.setAcademicYear(seatMatrix.getAcademicYear());
        result.setTotalSeats(seatMatrix.getTotalSeats());
        result.setPreviouslyAllotted(previousAllotted);
        result.setNewlyAllottedCount(seatMatrix.getAllotted() - previousAllotted);
        result.setTotalAllottedNow(seatMatrix.getAllotted());
        result.setVacanciesRemaining(seatMatrix.getTotalSeats() - seatMatrix.getAllotted());
        result.setNewlyAllottedApplications(newlyAllotted);

        return result;
    }

    // Candidate confirms seat acceptance (SRS FR6)
    @Transactional
    public AdmissionApplication confirmSeat(Long applicationId) {
        AdmissionApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (app.getStatus() != ApplicationStatus.ALLOTTED) {
            throw new IllegalStateException("Only allotted applications can be confirmed");
        }

        // Moves to verified stage awaiting fee payment
        app.setStatus(ApplicationStatus.VERIFIED);
        AdmissionApplication saved = applicationRepository.save(app);

        if (app.getApplicant().getUser() != null) {
            notificationService.sendNotification(
                    app.getApplicant().getUser(),
                    "Seat Acceptance Confirmed",
                    "Your seat acceptance for " + app.getProgramme().getName() + " is confirmed. Please proceed to fee payment.",
                    "ALLOTMENT"
            );
        }

        return saved;
    }

    // Candidate requests upgrade to higher-ranked preference (SRS FR6)
    @Transactional
    public AdmissionApplication requestUpgrade(Long applicationId) {
        AdmissionApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (app.getStatus() != ApplicationStatus.ALLOTTED && app.getStatus() != ApplicationStatus.VERIFIED) {
            throw new IllegalStateException("Upgrade can only be requested for active allotted applications");
        }

        app.setUpgradeRequested(true);
        AdmissionApplication saved = applicationRepository.save(app);

        if (app.getApplicant().getUser() != null) {
            notificationService.sendNotification(
                    app.getApplicant().getUser(),
                    "Upgrade Option Registered",
                    "Your request for upgrade to a higher-ranked preference in subsequent rounds has been registered.",
                    "ALLOTMENT"
            );
        }

        return saved;
    }

    // Candidate or counsellor cancels seat -> triggers automatic waitlist promotion (SRS FR6)
    @Transactional
    public AdmissionApplication cancelSeat(Long applicationId) {
        AdmissionApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        String cancelledQuota = app.getAllottedQuota();
        Integer cancelledRound = app.getAllottedRound();
        Long progId = app.getProgramme().getId();

        app.setStatus(ApplicationStatus.CANCELLED);
        app.setUpgradeRequested(false);
        AdmissionApplication saved = applicationRepository.save(app);

        // Decrement seat matrix allotted count
        if (cancelledQuota != null && cancelledRound != null) {
            Optional<SeatMatrix> smOpt = seatMatrixRepository
                    .findByProgramme_IdAndQuotaAndRoundNoAndAcademicYear(progId, cancelledQuota, cancelledRound, app.getAcademicYear());
            if (smOpt.isPresent()) {
                SeatMatrix sm = smOpt.get();
                if (sm.getAllotted() > 0) {
                    sm.setAllotted(sm.getAllotted() - 1);
                    seatMatrixRepository.save(sm);

                    // Immediate automatic waitlist promotion (SRS FR6)
                    promoteNextWaitlistCandidate(progId, cancelledQuota, sm);
                }
            }
        }

        return saved;
    }

    // Automatic waitlist promotion (SRS FR6: "Waitlist managed in strict merit rank order with automatic promotion")
    @Transactional
    public void promoteNextWaitlistCandidate(Long programmeId, String quota, SeatMatrix seatMatrix) {
        Optional<WaitlistEntry> nextEntry = waitlistRepository
                .findFirstByProgramme_IdAndQuotaAndStatusOrderByRankPositionAsc(
                        programmeId, quota, WaitlistEntry.WaitlistStatus.WAITING);

        if (nextEntry.isPresent() && seatMatrix.hasVacancy()) {
            WaitlistEntry entry = nextEntry.get();
            AdmissionApplication app = entry.getApplication();

            if (app.getStatus() == ApplicationStatus.SUBMITTED || app.getStatus() == ApplicationStatus.VERIFIED) {
                app.setStatus(ApplicationStatus.ALLOTTED);
                app.setAllottedQuota(quota);
                app.setAllottedRound(seatMatrix.getRoundNo());
                app.setAcceptanceDeadline(LocalDateTime.now().plusHours(72));
                applicationRepository.save(app);

                seatMatrix.setAllotted(seatMatrix.getAllotted() + 1);
                seatMatrixRepository.save(seatMatrix);

                entry.setStatus(WaitlistEntry.WaitlistStatus.PROMOTED);
                waitlistRepository.save(entry);

                if (app.getApplicant().getUser() != null) {
                    notificationService.sendNotification(
                            app.getApplicant().getUser(),
                            "Waitlist Promotion Alert!",
                            "You have been promoted from the waitlist and allotted a seat in " + seatMatrix.getProgramme().getName() + " under " + quota + " quota. Please accept within 72 hours.",
                            "ALLOTMENT"
                    );
                }
            }
        }
    }

    public List<WaitlistEntry> getWaitlist(Long programmeId, String quota) {
        if (quota != null && !quota.isBlank()) {
            return waitlistRepository.findByProgramme_IdAndQuotaAndStatusOrderByRankPositionAsc(
                    programmeId, quota, WaitlistEntry.WaitlistStatus.WAITING);
        }
        return waitlistRepository.findByProgramme_IdAndStatusOrderByRankPositionAsc(
                programmeId, WaitlistEntry.WaitlistStatus.WAITING);
    }

    private void addCandidateToWaitlist(AdmissionApplication application, SeatMatrix seatMatrix, int rankPosition) {
        List<WaitlistEntry> existing = waitlistRepository.findByApplication_Id(application.getId());
        if (existing.isEmpty()) {
            WaitlistEntry entry = new WaitlistEntry(
                    application,
                    seatMatrix.getProgramme(),
                    seatMatrix.getQuota(),
                    seatMatrix.getRoundNo(),
                    rankPosition
            );
            waitlistRepository.save(entry);
        }
    }

    private boolean applicantHoldsActiveSeatElsewhere(Long applicantId, Long currentApplicationId) {
        List<AdmissionApplication> applicantApps = applicationRepository.findByApplicant_Id(applicantId);
        return applicantApps.stream()
                .anyMatch(a -> !a.getId().equals(currentApplicationId) &&
                        (a.getStatus() == ApplicationStatus.ALLOTTED || a.getStatus() == ApplicationStatus.JOINED));
    }
}

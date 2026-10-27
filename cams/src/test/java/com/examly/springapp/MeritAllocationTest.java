package com.examly.springapp;

import com.examly.springapp.dto.AllocationResultDto;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.SeatConflictException;
import com.examly.springapp.repository.ApplicantRepository;
import com.examly.springapp.repository.ProgrammeRepository;
import com.examly.springapp.repository.SeatMatrixRepository;
import com.examly.springapp.service.ApplicationService;
import com.examly.springapp.service.SeatAllocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class MeritAllocationTest {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private SeatAllocationService seatAllocationService;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    private Programme programme;
    private Applicant cand1;
    private Applicant cand2;
    private SeatMatrix seatMatrix;

    @BeforeEach
    public void setup() {
        programme = new Programme("B.Tech CSE Test", "CSE", 60, 4, true);
        programme.setMeritFormula("{\"boardWeight\":0.5,\"entranceWeight\":0.5}");
        programme = programmeRepository.save(programme);

        // cand1: 90 board, 90 entrance -> merit score = 90
        cand1 = new Applicant("Candidate One", "c1_" + System.currentTimeMillis() + "@test.com",
                "9876543210", "GEN", 90.0, 90.0);
        cand1 = applicantRepository.save(cand1);

        // cand2: 80 board, 80 entrance -> merit score = 80
        cand2 = new Applicant("Candidate Two", "c2_" + System.currentTimeMillis() + "@test.com",
                "9876543211", "GEN", 80.0, 80.0);
        cand2 = applicantRepository.save(cand2);

        applicationService.submitApplication(cand1.getId(), programme.getId(), 1);
        applicationService.submitApplication(cand2.getId(), programme.getId(), 1);

        // Seat matrix with only 1 seat
        seatMatrix = new SeatMatrix(programme, "GEN", 1, 1, "2026-27");
        seatMatrix = seatMatrixRepository.save(seatMatrix);
    }

    @Test
    public void testMeritRanking() {
        List<AdmissionApplication> meritList = applicationService.getMeritList(programme.getId());
        assertEquals(2, meritList.size());
        assertEquals("Candidate One", meritList.get(0).getApplicant().getName());
        assertEquals(90.0, meritList.get(0).getMeritScore());
        assertEquals("Candidate Two", meritList.get(1).getApplicant().getName());
        assertEquals(80.0, meritList.get(1).getMeritScore());
    }

    @Test
    public void testSeatAllocationAndCapacity() {
        AllocationResultDto result = seatAllocationService.runAllocationWithStats(seatMatrix.getId());
        assertNotNull(result);
        assertEquals(1, result.getNewlyAllottedCount());
        assertEquals(1, result.getTotalAllottedNow());
        assertEquals(0, result.getVacanciesRemaining());

        // Attempting to run again when no vacancy left throws SeatConflictException
        assertThrows(SeatConflictException.class, () -> seatAllocationService.allocateSeats(seatMatrix.getId()));
    }

    @Test
    public void testSeatConfirmationAndCancellationWithWaitlist() {
        seatAllocationService.allocateSeats(seatMatrix.getId());

        List<AdmissionApplication> merit = applicationService.getMeritList(programme.getId());
        AdmissionApplication allottedApp = merit.get(0);
        assertEquals(ApplicationStatus.ALLOTTED, allottedApp.getStatus());
        assertNotNull(allottedApp.getAcceptanceDeadline());

        // Confirm seat
        AdmissionApplication confirmed = seatAllocationService.confirmSeat(allottedApp.getId());
        assertEquals(ApplicationStatus.VERIFIED, confirmed.getStatus());

        // Candidate requests upgrade
        AdmissionApplication upgraded = seatAllocationService.requestUpgrade(confirmed.getId());
        assertTrue(upgraded.getUpgradeRequested());

        // Candidate cancels seat -> triggers automatic waitlist promotion
        AdmissionApplication cancelled = seatAllocationService.cancelSeat(upgraded.getId());
        assertEquals(ApplicationStatus.CANCELLED, cancelled.getStatus());
    }
}

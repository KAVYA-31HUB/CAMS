package com.examly.springapp;

import com.examly.springapp.dto.ApplicationSubmissionDto;
import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.Applicant;
import com.examly.springapp.entity.Programme;
import com.examly.springapp.exception.DuplicateApplicationException;
import com.examly.springapp.repository.ApplicantRepository;
import com.examly.springapp.repository.ProgrammeRepository;
import com.examly.springapp.service.ApplicationService;
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
public class ApplicationServiceTest {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    private Applicant testApplicant;
    private Programme testProgramme1;
    private Programme testProgramme2;

    @BeforeEach
    public void setup() {
        testApplicant = new Applicant("Pooja Nair", "pooja" + System.currentTimeMillis() + "@test.com",
                "9876543210", "GEN", 95.0, 90.0);
        testApplicant = applicantRepository.save(testApplicant);

        testProgramme1 = new Programme("B.Tech AI Test", "CSE", 60, 4, true);
        testProgramme1.setMeritFormula("{\"boardWeight\":0.4,\"entranceWeight\":0.6}");
        testProgramme1 = programmeRepository.save(testProgramme1);

        testProgramme2 = new Programme("B.Tech Robotics Test", "ECE", 60, 4, true);
        testProgramme2.setMeritFormula("{\"boardWeight\":0.5,\"entranceWeight\":0.5}");
        testProgramme2 = programmeRepository.save(testProgramme2);
    }

    @Test
    public void testSubmitApplication() {
        AdmissionApplication app = applicationService.submitApplication(testApplicant.getId(), testProgramme1.getId(), 1);
        assertNotNull(app);
        assertNotNull(app.getId());
        assertNotNull(app.getApplicationNumber());
        assertEquals(1, app.getPreferenceRank());
        // 95.0 * 0.4 + 90.0 * 0.6 = 38 + 54 = 92.0
        assertEquals(92.0, app.getMeritScore());
    }

    @Test
    public void testDuplicateApplicationThrowsException() {
        applicationService.submitApplication(testApplicant.getId(), testProgramme1.getId(), 1);

        assertThrows(DuplicateApplicationException.class, () ->
                applicationService.submitApplication(testApplicant.getId(), testProgramme1.getId(), 2));
    }

    @Test
    public void testMultiPreferenceApplication() {
        ApplicationSubmissionDto dto = new ApplicationSubmissionDto();
        dto.setApplicantId(testApplicant.getId());
        dto.setProgrammeIds(List.of(testProgramme1.getId(), testProgramme2.getId()));
        dto.setAcademicYear("2026-27");

        List<AdmissionApplication> applications = applicationService.submitMultiPreferenceApplication(dto);
        assertEquals(2, applications.size());
        assertEquals(1, applications.get(0).getPreferenceRank());
        assertEquals(2, applications.get(1).getPreferenceRank());
    }
}

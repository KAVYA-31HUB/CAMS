package com.examly.springapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionScheduleController {

    @GetMapping("/schedule")
    public ResponseEntity<List<Map<String, String>>> getAdmissionSchedule() {
        List<Map<String, String>> schedule = new ArrayList<>();

        schedule.add(createEvent("Online Application Portal Opens", "September 01, 2026", "COMPLETED",
                "Central admissions portal opened for 2026-27 online registrations."));
        schedule.add(createEvent("Last Date for Online Registration & Document Upload", "September 30, 2026", "ACTIVE",
                "Final deadline for registration, 5-programme preference ranking, and certificate uploads."));
        schedule.add(createEvent("Counsellor Document Verification Window", "October 01 - October 08, 2026", "UPCOMING",
                "Verification of uploaded 10th/12th marks, identity proofs, and caste/EWS certificates."));
        schedule.add(createEvent("Publication of Official Round 1 Merit List", "October 12, 2026", "UPCOMING",
                "Programme-wise candidate rank lists computed according to approved formula weights."));
        schedule.add(createEvent("Round 1 Seat Allotment & 72h Acceptance Window", "October 14 - October 18, 2026", "UPCOMING",
                "Provisional quota seats allocated. Candidates must accept seat or request auto-upgrade within 72 hours."));
        schedule.add(createEvent("Round 1 Fee Payment Deadline", "October 21, 2026", "UPCOMING",
                "Online tuition fee remittance and GST tax invoice issuance to confirm provisional admission."));
        schedule.add(createEvent("Round 2 Upgrade Allotment & Waitlist Promotion", "October 25, 2026", "UPCOMING",
                "Re-allocation of forfeited and vacant quota seats to eligible waitlisted applicants."));
        schedule.add(createEvent("Final Admission Confirmation & Campus Reporting", "October 30, 2026", "UPCOMING",
                "Official admission letters generated and orientation details communicated."));

        return ResponseEntity.ok(schedule);
    }

    private Map<String, String> createEvent(String event, String date, String status, String desc) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("event", event);
        map.put("date", date);
        map.put("status", status);
        map.put("description", desc);
        return map;
    }
}

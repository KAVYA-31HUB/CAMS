package com.examly.springapp.controller;

import com.examly.springapp.dto.AllocationResultDto;
import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.ApplicationStatus;
import com.examly.springapp.entity.SeatMatrix;
import com.examly.springapp.entity.WaitlistEntry;
import com.examly.springapp.repository.AdmissionApplicationRepository;
import com.examly.springapp.repository.SeatMatrixRepository;
import com.examly.springapp.service.SeatAllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/allocation")
public class AllocationController {

    @Autowired
    private SeatAllocationService seatAllocationService;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    // Backward-compatible endpoint: POST /api/allocation/run/{seatMatrixId}
    @PostMapping("/run/{seatMatrixId}")
    public ResponseEntity<List<AdmissionApplication>> runAllocation(@PathVariable Long seatMatrixId) {
        return ResponseEntity.ok(seatAllocationService.allocateSeats(seatMatrixId));
    }

    // Extended allocation runner with full stats response
    @PostMapping("/run-matrix/{seatMatrixId}")
    public ResponseEntity<AllocationResultDto> runAllocationStats(@PathVariable Long seatMatrixId) {
        return ResponseEntity.ok(seatAllocationService.runAllocationWithStats(seatMatrixId));
    }

    // SRS Appendix H: POST /api/allocation/run - runs allocation for all quotas in round
    @PostMapping("/run")
    public ResponseEntity<List<AllocationResultDto>> runAllocationForRound(
            @RequestBody(required = false) Map<String, Object> body) {
        Integer roundNo = 1;
        String academicYear = "2026-27";
        if (body != null) {
            if (body.containsKey("roundNo")) roundNo = Integer.valueOf(body.get("roundNo").toString());
            if (body.containsKey("academicYear")) academicYear = body.get("academicYear").toString();
        }

        List<SeatMatrix> list = seatMatrixRepository.findByRoundNoAndAcademicYear(roundNo, academicYear);
        List<AllocationResultDto> results = new ArrayList<>();
        for (SeatMatrix sm : list) {
            try {
                results.add(seatAllocationService.runAllocationWithStats(sm.getId()));
            } catch (Exception ignored) {
                // If quota already full, skip or record
            }
        }
        return ResponseEntity.ok(results);
    }

    // SRS Appendix H: GET /api/allocation/results/{round}
    @GetMapping("/results/{round}")
    public ResponseEntity<List<AdmissionApplication>> getAllotmentResults(@PathVariable Integer round) {
        List<AdmissionApplication> allotted = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ALLOTTED || a.getStatus() == ApplicationStatus.JOINED)
                .filter(a -> a.getAllottedRound() != null && a.getAllottedRound().equals(round))
                .toList();
        return ResponseEntity.ok(allotted);
    }

    // SRS Appendix H: PUT /api/allocation/{id}/upgrade
    @PutMapping("/{id}/upgrade")
    public ResponseEntity<AdmissionApplication> requestUpgrade(@PathVariable Long id) {
        return ResponseEntity.ok(seatAllocationService.requestUpgrade(id));
    }

    // SRS Appendix H: POST /api/allocation/confirm/{id}
    @PostMapping("/confirm/{id}")
    public ResponseEntity<AdmissionApplication> confirmSeat(@PathVariable Long id) {
        return ResponseEntity.ok(seatAllocationService.confirmSeat(id));
    }

    // Cancel seat allotment and trigger waitlist promotion
    @DeleteMapping("/{id}")
    public ResponseEntity<AdmissionApplication> cancelSeat(@PathVariable Long id) {
        return ResponseEntity.ok(seatAllocationService.cancelSeat(id));
    }

    // SRS Appendix H: GET /api/allocation/waitlist/{progId}
    @GetMapping("/waitlist/{progId}")
    public ResponseEntity<List<WaitlistEntry>> getWaitlist(
            @PathVariable Long progId,
            @RequestParam(required = false) String quota) {
        return ResponseEntity.ok(seatAllocationService.getWaitlist(progId, quota));
    }
}

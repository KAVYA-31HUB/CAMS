package com.examly.springapp.controller;

import com.examly.springapp.entity.SeatMatrix;
import com.examly.springapp.repository.SeatMatrixRepository;
import com.examly.springapp.service.SeatMatrixService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seat-matrix")
public class SeatMatrixController {

    @Autowired
    private SeatMatrixService seatMatrixService;

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    // Supports both query params and JSON request body
    @PostMapping
    public ResponseEntity<SeatMatrix> createSeatMatrix(
            @RequestParam(required = false) Long programmeId,
            @RequestParam(required = false) String quota,
            @RequestParam(required = false) Integer totalSeats,
            @RequestParam(required = false) Integer roundNo,
            @RequestParam(required = false) String academicYear,
            @RequestBody(required = false) Map<String, Object> body) {

        if (programmeId == null && body != null && body.containsKey("programmeId")) {
            programmeId = Long.valueOf(body.get("programmeId").toString());
        }
        if (quota == null && body != null && body.containsKey("quota")) {
            quota = body.get("quota").toString();
        }
        if (totalSeats == null && body != null && body.containsKey("totalSeats")) {
            totalSeats = Integer.valueOf(body.get("totalSeats").toString());
        }
        if (roundNo == null && body != null && body.containsKey("roundNo")) {
            roundNo = Integer.valueOf(body.get("roundNo").toString());
        }
        if (academicYear == null && body != null && body.containsKey("academicYear")) {
            academicYear = body.get("academicYear").toString();
        }

        if (academicYear == null || academicYear.isBlank()) {
            academicYear = "2026-27";
        }
        if (roundNo == null) {
            roundNo = 1;
        }

        if (programmeId == null || quota == null || totalSeats == null) {
            throw new IllegalArgumentException("programmeId, quota, and totalSeats are required");
        }

        SeatMatrix saved = seatMatrixService.createSeatMatrix(programmeId, quota, totalSeats, roundNo, academicYear);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<SeatMatrix>> getAllSeatMatrix(
            @RequestParam(required = false) Long programmeId) {
        if (programmeId != null) {
            return ResponseEntity.ok(seatMatrixRepository.findByProgramme_Id(programmeId));
        }
        return ResponseEntity.ok(seatMatrixService.getAllSeatMatrix());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatMatrix> getSeatMatrixById(@PathVariable Long id) {
        return ResponseEntity.ok(seatMatrixService.getSeatMatrixById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSeatMatrix(@PathVariable Long id) {
        seatMatrixService.deleteSeatMatrix(id);
        return ResponseEntity.ok("Seat matrix row deleted successfully");
    }
}

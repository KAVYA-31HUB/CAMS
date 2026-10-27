package com.examly.springapp.controller;

import com.examly.springapp.dto.FeePaymentRequestDto;
import com.examly.springapp.dto.FeeReceiptDto;
import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.ApplicationStatus;
import com.examly.springapp.entity.FeePayment;
import com.examly.springapp.entity.PaymentMode;
import com.examly.springapp.repository.AdmissionApplicationRepository;
import com.examly.springapp.service.FeePaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeePaymentController {

    @Autowired
    private FeePaymentService feePaymentService;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private com.examly.springapp.repository.UserRepository userRepository;

    @Autowired
    private com.examly.springapp.repository.ApplicantRepository applicantRepository;

    // Backward-compatible: POST /api/fees/initiate?applicantId=1&amount=50000&mode=UPI
    @PostMapping("/initiate")
    public ResponseEntity<FeePayment> initiatePayment(
            @RequestParam(required = false) Long applicantId,
            @RequestParam(required = false) Double amount,
            @RequestParam(required = false) PaymentMode mode,
            @RequestBody(required = false) FeePaymentRequestDto bodyDto) {

        if (applicantId == null && bodyDto != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(feePaymentService.processPayment(bodyDto));
        }

        FeePayment payment = feePaymentService.initiatePayment(applicantId, amount, mode != null ? mode : PaymentMode.UPI);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    // JSON body fee payment endpoint
    @PostMapping("/pay")
    public ResponseEntity<FeePayment> payFee(@Valid @RequestBody FeePaymentRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feePaymentService.processPayment(dto));
    }

    @GetMapping
    public ResponseEntity<List<FeePayment>> getAllPayments() {
        return ResponseEntity.ok(feePaymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeePayment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(feePaymentService.getPaymentById(id));
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<FeePayment>> getByApplicant(@PathVariable Long applicantId) {
        return ResponseEntity.ok(feePaymentService.getPaymentsByApplicant(applicantId));
    }

    // SRS Appendix H: GET /api/fees/receipt/{id}
    @GetMapping("/receipt/{id}")
    public ResponseEntity<FeeReceiptDto> getPaymentReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(feePaymentService.getReceipt(id));
    }

    // SRS Appendix H: GET /api/fees/outstanding and /api/fees/outstanding/{applicantId}
    @GetMapping({"/outstanding", "/outstanding/{applicantId}"})
    public ResponseEntity<Map<String, Object>> getOutstandingFees(@PathVariable(required = false) Long applicantId) {
        if (applicantId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                com.examly.springapp.entity.User user = userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
                if (user != null) {
                    com.examly.springapp.entity.Applicant applicant = applicantRepository.findByUserId(user.getId()).orElse(null);
                    if (applicant != null) {
                        applicantId = applicant.getId();
                    }
                }
            }
        }

        Map<String, Object> resp = new HashMap<>();
        if (applicantId == null) {
            resp.put("totalFee", 0.0);
            resp.put("paidAmount", 0.0);
            resp.put("outstandingAmount", 0.0);
            resp.put("status", "NO_ACTIVE_ALLOTMENT");
            return ResponseEntity.ok(resp);
        }

        List<AdmissionApplication> apps = applicationRepository.findByApplicant_Id(applicantId);
        AdmissionApplication activeApp = apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ALLOTTED ||
                        a.getStatus() == ApplicationStatus.VERIFIED ||
                        a.getStatus() == ApplicationStatus.JOINED)
                .findFirst().orElse(null);

        if (activeApp != null && activeApp.getProgramme() != null) {
            double tuition = activeApp.getProgramme().getTuitionFee() != null ? activeApp.getProgramme().getTuitionFee() : 75000.0;
            double other = activeApp.getProgramme().getOtherFee() != null ? activeApp.getProgramme().getOtherFee() : 15000.0;
            double totalFee = tuition + other;

            List<FeePayment> payments = feePaymentService.getPaymentsByApplicant(applicantId);
            double paid = payments.stream()
                    .filter(p -> p.getStatus() == com.examly.springapp.entity.PaymentStatus.COMPLETED)
                    .mapToDouble(FeePayment::getAmount)
                    .sum();

            double outstanding = Math.max(0.0, totalFee - paid);
            resp.put("applicationId", activeApp.getId());
            resp.put("applicationNumber", activeApp.getApplicationNumber() != null ? activeApp.getApplicationNumber() : "CAMS-2026-APP");
            resp.put("programmeName", activeApp.getProgramme().getName());
            resp.put("totalFee", totalFee);
            resp.put("paidAmount", paid);
            resp.put("outstandingAmount", outstanding);
            resp.put("status", outstanding <= 0 ? "PAID" : "PENDING");
        } else {
            AdmissionApplication anyApp = apps.stream().findFirst().orElse(null);
            if (anyApp != null) {
                resp.put("applicationId", anyApp.getId());
                resp.put("applicationNumber", anyApp.getApplicationNumber());
                if (anyApp.getProgramme() != null) {
                    resp.put("programmeName", anyApp.getProgramme().getName());
                }
            }
            resp.put("totalFee", 0.0);
            resp.put("paidAmount", 0.0);
            resp.put("outstandingAmount", 0.0);
            resp.put("status", "NO_ACTIVE_ALLOTMENT");
        }

        return ResponseEntity.ok(resp);
    }
}

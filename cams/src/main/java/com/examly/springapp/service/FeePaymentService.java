package com.examly.springapp.service;

import com.examly.springapp.dto.FeePaymentRequestDto;
import com.examly.springapp.dto.FeeReceiptDto;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.AdmissionApplicationRepository;
import com.examly.springapp.repository.FeePaymentRepository;
import com.examly.springapp.repository.ScholarshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FeePaymentService {

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private ScholarshipRepository scholarshipRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    // Backward-compatible method
    public FeePayment initiatePayment(Long applicantId, Double amount, PaymentMode mode) {
        FeePaymentRequestDto dto = new FeePaymentRequestDto();
        dto.setApplicantId(applicantId);
        dto.setAmount(amount);
        dto.setPaymentMode(mode);
        return processPayment(dto);
    }

    // FR8: Full fee payment processor with GST compliance, HSN code, and application update
    @Transactional
    public FeePayment processPayment(FeePaymentRequestDto dto) {
        Applicant applicant = applicantService.getApplicantById(dto.getApplicantId());

        FeePayment payment = new FeePayment(applicant, dto.getAmount(), dto.getPaymentMode());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setInvoiceNumber("INV-2026-" + String.format("%05d", (int)(Math.random() * 90000) + 10000));
        payment.setHsnCode("999293"); // Educational services GST HSN code
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setRemarks(dto.getRemarks());

        // Calculate breakdown
        double baseAmount = dto.getAmount();
        payment.setTuitionFee(baseAmount * 0.75);
        payment.setHostelFee(baseAmount * 0.15);
        payment.setExamFee(baseAmount * 0.10);
        payment.setGstAmount(0.0); // Higher education tuition exempted under Notification 12/2017-CT(R)

        // Check for approved scholarships
        List<Scholarship> scholarships = scholarshipRepository.findByApplicant_Id(applicant.getId());
        double totalScholarship = scholarships.stream()
                .filter(s -> s.getStatus() == Scholarship.ScholarshipStatus.APPROVED)
                .mapToDouble(Scholarship::getApprovedAmount)
                .sum();
        payment.setScholarshipDeduction(totalScholarship);

        // Associate application if provided or find candidate's active allotted application
        if (dto.getApplicationId() != null) {
            applicationRepository.findById(dto.getApplicationId()).ifPresent(app -> {
                payment.setApplication(app);
                app.setStatus(ApplicationStatus.JOINED);
                applicationRepository.save(app);
            });
        } else {
            List<AdmissionApplication> apps = applicationRepository.findByApplicant_Id(applicant.getId());
            apps.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.ALLOTTED || a.getStatus() == ApplicationStatus.VERIFIED)
                    .findFirst()
                    .ifPresent(app -> {
                        payment.setApplication(app);
                        app.setStatus(ApplicationStatus.JOINED);
                        applicationRepository.save(app);
                    });
        }

        FeePayment saved = feePaymentRepository.save(payment);

        auditService.log(
                applicant.getUser() != null ? applicant.getUser().getId() : null,
                applicant.getEmail(),
                "APPLICANT",
                "FEE_PAID",
                "FeePayment",
                saved.getId().toString(),
                "Payment of ₹" + dto.getAmount() + " completed via " + dto.getPaymentMode().name() + " (Invoice: " + saved.getInvoiceNumber() + ")",
                "127.0.0.1"
        );

        if (applicant.getUser() != null) {
            notificationService.sendNotification(
                    applicant.getUser(),
                    "Fee Payment Confirmed",
                    "Your admission fee payment of ₹" + dto.getAmount() + " was successful. Invoice No: " + saved.getInvoiceNumber() + ". Your admission is now CONFIRMED.",
                    "FEE"
            );
        }

        return saved;
    }

    public List<FeePayment> getAllPayments() {
        return feePaymentRepository.findAll();
    }

    public FeePayment getPaymentById(Long id) {
        return feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    public List<FeePayment> getPaymentsByApplicant(Long applicantId) {
        return feePaymentRepository.findByApplicant_Id(applicantId);
    }

    // FR8: GST-compliant receipt generator
    public FeeReceiptDto getReceipt(Long paymentId) {
        FeePayment p = getPaymentById(paymentId);

        FeeReceiptDto receipt = new FeeReceiptDto();
        receipt.setInvoiceNumber(p.getInvoiceNumber() != null ? p.getInvoiceNumber() : "INV-" + p.getId());
        receipt.setTransactionId(p.getTransactionId());
        receipt.setHsnCode(p.getHsnCode());
        receipt.setGstin("33AAAAA0000A1Z5");
        receipt.setApplicantName(p.getApplicant().getName());
        receipt.setApplicantEmail(p.getApplicant().getEmail());
        receipt.setApplicantPhone(p.getApplicant().getPhone());

        if (p.getApplication() != null) {
            receipt.setApplicationNumber(p.getApplication().getApplicationNumber());
            receipt.setProgrammeName(p.getApplication().getProgramme().getName());
            receipt.setAcademicYear(p.getApplication().getAcademicYear());
        } else {
            receipt.setApplicationNumber("CAMS-2026-N/A");
            receipt.setProgrammeName("Higher Education Admission");
            receipt.setAcademicYear("2026-27");
        }

        receipt.setTuitionFee(p.getTuitionFee() != null ? p.getTuitionFee() : p.getAmount() * 0.75);
        receipt.setHostelFee(p.getHostelFee() != null ? p.getHostelFee() : p.getAmount() * 0.15);
        receipt.setExamFee(p.getExamFee() != null ? p.getExamFee() : p.getAmount() * 0.10);
        receipt.setScholarshipDeduction(p.getScholarshipDeduction() != null ? p.getScholarshipDeduction() : 0.0);
        receipt.setTaxableAmount(p.getAmount());
        receipt.setCgst(0.0);
        receipt.setSgst(0.0);
        receipt.setTotalPaid(p.getAmount());
        receipt.setPaymentMode(p.getPaymentMode());
        receipt.setPaymentStatus(p.getStatus());
        receipt.setPaidAt(p.getPaidAt());

        return receipt;
    }

    public Double getTotalCollections() {
        return feePaymentRepository.getTotalCollections();
    }
}

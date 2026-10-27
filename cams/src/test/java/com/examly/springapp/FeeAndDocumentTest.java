package com.examly.springapp;

import com.examly.springapp.dto.*;
import com.examly.springapp.entity.*;
import com.examly.springapp.repository.ApplicantRepository;
import com.examly.springapp.service.DocumentService;
import com.examly.springapp.service.FeePaymentService;
import com.examly.springapp.service.ScholarshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class FeeAndDocumentTest {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private FeePaymentService feePaymentService;

    @Autowired
    private ScholarshipService scholarshipService;

    @Autowired
    private ApplicantRepository applicantRepository;

    private Applicant applicant;

    @BeforeEach
    public void setup() {
        applicant = new Applicant("Anand Kumar", "anand" + System.currentTimeMillis() + "@test.com",
                "9876543210", "GEN", 88.0, 92.0);
        applicant = applicantRepository.save(applicant);
    }

    @Test
    public void testDocumentUploadAndVerification() {
        DocumentUploadDto uploadDto = new DocumentUploadDto();
        uploadDto.setApplicantId(applicant.getId());
        uploadDto.setDocumentType(DocumentType.MARKSHEET_12);
        uploadDto.setFileName("marksheet12.pdf");
        uploadDto.setFileType("application/pdf");
        uploadDto.setFileSize(204800L);
        uploadDto.setFileData("data:application/pdf;base64,JVBERi0xLjQKJVRlc3Q=");

        Document doc = documentService.uploadDocument(uploadDto);
        assertNotNull(doc);
        assertNotNull(doc.getFileHash());
        assertEquals(VerificationStatus.PENDING, doc.getVerificationStatus());

        // Counsellor verifies document
        DocumentVerificationDto verifyDto = new DocumentVerificationDto();
        verifyDto.setStatus(VerificationStatus.VERIFIED);
        verifyDto.setRemarks("All marks match board records");

        Document verified = documentService.verifyDocument(doc.getId(), verifyDto, "counsellor@cams.edu");
        assertEquals(VerificationStatus.VERIFIED, verified.getVerificationStatus());
        assertEquals("counsellor@cams.edu", verified.getVerifiedBy());
    }

    @Test
    public void testDiscrepancyRequiresRemarks() {
        DocumentUploadDto uploadDto = new DocumentUploadDto();
        uploadDto.setApplicantId(applicant.getId());
        uploadDto.setDocumentType(DocumentType.IDENTITY_PROOF);
        uploadDto.setFileName("aadhar.pdf");
        uploadDto.setFileData("data:application/pdf;base64,JVBERi0xLjQKJVRlc3Q=");

        Document doc = documentService.uploadDocument(uploadDto);

        DocumentVerificationDto discDto = new DocumentVerificationDto();
        discDto.setStatus(VerificationStatus.DISCREPANT);
        discDto.setRemarks(""); // Empty remarks

        assertThrows(IllegalArgumentException.class, () ->
                documentService.verifyDocument(doc.getId(), discDto, "counsellor@cams.edu"));
    }

    @Test
    public void testFeePaymentAndReceiptGeneration() {
        FeePaymentRequestDto feeDto = new FeePaymentRequestDto();
        feeDto.setApplicantId(applicant.getId());
        feeDto.setAmount(65000.0);
        feeDto.setPaymentMode(PaymentMode.UPI);
        feeDto.setRemarks("Term 1 Admission Fee");

        FeePayment payment = feePaymentService.processPayment(feeDto);
        assertNotNull(payment);
        assertNotNull(payment.getTransactionId());
        assertNotNull(payment.getInvoiceNumber());
        assertEquals("999293", payment.getHsnCode());
        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());

        // Receipt verification
        FeeReceiptDto receipt = feePaymentService.getReceipt(payment.getId());
        assertNotNull(receipt);
        assertEquals(payment.getInvoiceNumber(), receipt.getInvoiceNumber());
        assertEquals("999293", receipt.getHsnCode());
        assertEquals(applicant.getName(), receipt.getApplicantName());
        assertEquals(65000.0, receipt.getTotalPaid());
    }

    @Test
    public void testScholarshipApplicationAndReview() {
        ScholarshipApplyDto applyDto = new ScholarshipApplyDto();
        applyDto.setApplicantId(applicant.getId());
        applyDto.setSchemeName("Merit-cum-Means Grant");
        applyDto.setAnnualIncome(180000.0);
        applyDto.setRequestedAmount(25000.0);

        Scholarship scholarship = scholarshipService.applyForScholarship(applyDto);
        assertNotNull(scholarship);
        assertEquals(Scholarship.ScholarshipStatus.PENDING, scholarship.getStatus());

        // Finance Officer review
        ScholarshipReviewDto reviewDto = new ScholarshipReviewDto();
        reviewDto.setStatus(Scholarship.ScholarshipStatus.APPROVED);
        reviewDto.setApprovedAmount(20000.0);
        reviewDto.setRemarks("Income certificate verified, approved for partial waiver");

        Scholarship reviewed = scholarshipService.reviewScholarship(scholarship.getId(), reviewDto, "finance@cams.edu");
        assertEquals(Scholarship.ScholarshipStatus.APPROVED, reviewed.getStatus());
        assertEquals(20000.0, reviewed.getApprovedAmount());
    }
}

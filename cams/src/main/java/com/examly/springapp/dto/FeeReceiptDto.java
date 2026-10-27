package com.examly.springapp.dto;

import com.examly.springapp.entity.PaymentMode;
import com.examly.springapp.entity.PaymentStatus;

import java.time.LocalDateTime;

public class FeeReceiptDto {

    private String institutionName = "College Admission Management System";
    private String invoiceNumber;
    private String transactionId;
    private String hsnCode = "999293";
    private String gstin = "33AAAAA0000A1Z5";

    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;
    private String applicationNumber;
    private String programmeName;
    private String academicYear;

    private Double tuitionFee = 0.0;
    private Double hostelFee = 0.0;
    private Double examFee = 0.0;
    private Double scholarshipDeduction = 0.0;
    private Double taxableAmount = 0.0;
    private Double cgst = 0.0; // 0% for higher education tuition under GST exemption
    private Double sgst = 0.0;
    private Double totalPaid = 0.0;

    private PaymentMode paymentMode;
    private PaymentStatus paymentStatus;
    private LocalDateTime paidAt;

    public FeeReceiptDto() {
    }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getHsnCode() { return hsnCode; }
    public void setHsnCode(String hsnCode) { this.hsnCode = hsnCode; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }

    public String getApplicantPhone() { return applicantPhone; }
    public void setApplicantPhone(String applicantPhone) { this.applicantPhone = applicantPhone; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public String getProgrammeName() { return programmeName; }
    public void setProgrammeName(String programmeName) { this.programmeName = programmeName; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Double getTuitionFee() { return tuitionFee; }
    public void setTuitionFee(Double tuitionFee) { this.tuitionFee = tuitionFee; }

    public Double getHostelFee() { return hostelFee; }
    public void setHostelFee(Double hostelFee) { this.hostelFee = hostelFee; }

    public Double getExamFee() { return examFee; }
    public void setExamFee(Double examFee) { this.examFee = examFee; }

    public Double getScholarshipDeduction() { return scholarshipDeduction; }
    public void setScholarshipDeduction(Double scholarshipDeduction) { this.scholarshipDeduction = scholarshipDeduction; }

    public Double getTaxableAmount() { return taxableAmount; }
    public void setTaxableAmount(Double taxableAmount) { this.taxableAmount = taxableAmount; }

    public Double getCgst() { return cgst; }
    public void setCgst(Double cgst) { this.cgst = cgst; }

    public Double getSgst() { return sgst; }
    public void setSgst(Double sgst) { this.sgst = sgst; }

    public Double getTotalPaid() { return totalPaid; }
    public void setTotalPaid(Double totalPaid) { this.totalPaid = totalPaid; }

    public PaymentMode getPaymentMode() { return paymentMode; }
    public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}

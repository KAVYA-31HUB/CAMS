package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

@Entity
@Table(name = "fee_payments")
public class FeePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Applicant applicant;

    @ManyToOne
    @JoinColumn(name = "application_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "applicant"})
    private AdmissionApplication application;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode = PaymentMode.UPI;

    @Column(unique = true)
    private String transactionId;

    @Column(unique = true)
    private String invoiceNumber;

    private String hsnCode = "999293"; // Educational services HSN code

    private Double tuitionFee = 0.0;
    private Double hostelFee = 0.0;
    private Double examFee = 0.0;
    private Double scholarshipDeduction = 0.0;
    private Double gstAmount = 0.0;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    private LocalDateTime paidAt;

    private String remarks;

    public FeePayment() {
    }

    public FeePayment(Applicant applicant, Double amount, PaymentMode paymentMode) {
        this.applicant = applicant;
        this.amount = amount;
        this.paymentMode = paymentMode;
        this.status = PaymentStatus.PENDING;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Applicant getApplicant() { return applicant; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }

    public AdmissionApplication getApplication() { return application; }
    public void setApplication(AdmissionApplication application) { this.application = application; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public PaymentMode getPaymentMode() { return paymentMode; }
    public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getHsnCode() { return hsnCode; }
    public void setHsnCode(String hsnCode) { this.hsnCode = hsnCode; }

    public Double getTuitionFee() { return tuitionFee; }
    public void setTuitionFee(Double tuitionFee) { this.tuitionFee = tuitionFee; }

    public Double getHostelFee() { return hostelFee; }
    public void setHostelFee(Double hostelFee) { this.hostelFee = hostelFee; }

    public Double getExamFee() { return examFee; }
    public void setExamFee(Double examFee) { this.examFee = examFee; }

    public Double getScholarshipDeduction() { return scholarshipDeduction; }
    public void setScholarshipDeduction(Double scholarshipDeduction) { this.scholarshipDeduction = scholarshipDeduction; }

    public Double getGstAmount() { return gstAmount; }
    public void setGstAmount(Double gstAmount) { this.gstAmount = gstAmount; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

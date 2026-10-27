package com.examly.springapp.repository;

import com.examly.springapp.entity.FeePayment;
import com.examly.springapp.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByApplicant_Id(Long applicantId);
    Optional<FeePayment> findByTransactionId(String transactionId);
    Optional<FeePayment> findByInvoiceNumber(String invoiceNumber);
    List<FeePayment> findByStatus(PaymentStatus status);
    long countByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM FeePayment f WHERE f.status = 'COMPLETED'")
    Double getTotalCollections();
}

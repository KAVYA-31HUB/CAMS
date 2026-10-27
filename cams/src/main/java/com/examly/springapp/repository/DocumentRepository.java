package com.examly.springapp.repository;

import com.examly.springapp.entity.Document;
import com.examly.springapp.entity.DocumentType;
import com.examly.springapp.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicant_Id(Long applicantId);
    List<Document> findByVerificationStatus(VerificationStatus verificationStatus);
    Optional<Document> findByApplicant_IdAndDocumentType(Long applicantId, DocumentType documentType);
    long countByVerificationStatus(VerificationStatus verificationStatus);
}

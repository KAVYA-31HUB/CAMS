package com.examly.springapp.service;

import com.examly.springapp.dto.DocumentUploadDto;
import com.examly.springapp.dto.DocumentVerificationDto;
import com.examly.springapp.entity.Applicant;
import com.examly.springapp.entity.Document;
import com.examly.springapp.entity.DocumentType;
import com.examly.springapp.entity.VerificationStatus;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ApplicantService applicantService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    @Transactional
    public Document uploadDocument(DocumentUploadDto dto) {
        Applicant applicant = applicantService.getApplicantById(dto.getApplicantId());

        String hash = computeHash(dto.getFileData());

        Optional<Document> existingOpt = documentRepository
                .findByApplicant_IdAndDocumentType(applicant.getId(), dto.getDocumentType());

        Document document;
        if (existingOpt.isPresent()) {
            document = existingOpt.get();
            document.setFileName(dto.getFileName());
            document.setFileType(dto.getFileType());
            document.setFileSize(dto.getFileSize());
            document.setFileData(dto.getFileData());
            document.setFileHash(hash);
            document.setVerificationStatus(VerificationStatus.PENDING);
            document.setRemarks(null);
            document.setVersion(document.getVersion() + 1);
            document.setUploadedAt(LocalDateTime.now());
            if (Boolean.TRUE.equals(dto.getIsDigiLocker())) {
                document.setIsDigiLockerVerified(true);
                document.setVerificationStatus(VerificationStatus.VERIFIED);
                document.setVerifiedBy("DigiLocker Government Gateway");
                document.setVerifiedAt(LocalDateTime.now());
            }
        } else {
            document = new Document(
                    applicant,
                    dto.getDocumentType(),
                    dto.getFileName(),
                    dto.getFileType(),
                    dto.getFileSize(),
                    dto.getFileData(),
                    hash
            );
            if (Boolean.TRUE.equals(dto.getIsDigiLocker())) {
                document.setIsDigiLockerVerified(true);
                document.setVerificationStatus(VerificationStatus.VERIFIED);
                document.setVerifiedBy("DigiLocker Government Gateway");
                document.setVerifiedAt(LocalDateTime.now());
            }
        }

        Document saved = documentRepository.save(document);

        auditService.log(
                applicant.getUser() != null ? applicant.getUser().getId() : null,
                applicant.getEmail(),
                "APPLICANT",
                "DOCUMENT_UPLOADED",
                "Document",
                saved.getId().toString(),
                "Uploaded document: " + dto.getDocumentType().name() + " (v" + saved.getVersion() + ")",
                "127.0.0.1"
        );

        return saved;
    }

    // DigiLocker integration boundary (SRS FR7 & FR15)
    @Transactional
    public Document importFromDigiLocker(Long applicantId, DocumentType type, String digiLockerUri) {
        DocumentUploadDto dto = new DocumentUploadDto();
        dto.setApplicantId(applicantId);
        dto.setDocumentType(type);
        dto.setFileName(type.name().toLowerCase() + "_digilocker_verified.pdf");
        dto.setFileType("application/pdf");
        dto.setFileSize(1024L * 150); // simulated size
        dto.setFileData("data:application/pdf;base64,JVBERi0xLjQKJUZha2VEaWdpTG9ja2VyQ2VydGlmaWNhdGVEYXRh");
        dto.setIsDigiLocker(true);

        return uploadDocument(dto);
    }

    @Transactional
    public Document verifyDocument(Long documentId, DocumentVerificationDto dto, String counsellorEmail) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (dto.getStatus() == VerificationStatus.DISCREPANT && (dto.getRemarks() == null || dto.getRemarks().isBlank())) {
            throw new IllegalArgumentException("Mandatory remarks are required when marking a document as discrepant");
        }

        document.setVerificationStatus(dto.getStatus());
        document.setRemarks(dto.getRemarks());
        document.setVerifiedBy(counsellorEmail != null ? counsellorEmail : "Staff Counsellor");
        document.setVerifiedAt(LocalDateTime.now());

        Document saved = documentRepository.save(document);

        // Discrepancy notification sent to applicant per SRS FR7
        if (dto.getStatus() == VerificationStatus.DISCREPANT && document.getApplicant().getUser() != null) {
            notificationService.sendNotification(
                    document.getApplicant().getUser(),
                    "Document Discrepancy Flagged",
                    "Your uploaded " + document.getDocumentType().name() + " was marked as discrepant. Reason: " + dto.getRemarks() + ". Please re-upload the correct document.",
                    "DOCUMENT"
            );
        } else if (dto.getStatus() == VerificationStatus.VERIFIED && document.getApplicant().getUser() != null) {
            notificationService.sendNotification(
                    document.getApplicant().getUser(),
                    "Document Verified",
                    "Your uploaded " + document.getDocumentType().name() + " has been verified successfully.",
                    "DOCUMENT"
            );
        }

        auditService.log(
                null,
                counsellorEmail,
                "COUNSELLOR",
                "DOCUMENT_VERIFIED",
                "Document",
                saved.getId().toString(),
                "Document " + document.getDocumentType().name() + " marked as " + dto.getStatus().name() + ". Remarks: " + dto.getRemarks(),
                "127.0.0.1"
        );

        return saved;
    }

    public List<Document> getDocumentsByApplicant(Long applicantId) {
        return documentRepository.findByApplicant_Id(applicantId);
    }

    public List<Document> getPendingDocuments() {
        return documentRepository.findByVerificationStatus(VerificationStatus.PENDING);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    private String computeHash(String data) {
        if (data == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(data.hashCode());
        }
    }
}

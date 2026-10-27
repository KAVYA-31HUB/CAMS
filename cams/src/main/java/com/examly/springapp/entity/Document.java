package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(nullable = false)
    private String fileName;

    private String fileType;

    private Long fileSize;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String fileData;

    private String fileHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private String remarks;

    private String verifiedBy;

    private LocalDateTime verifiedAt;

    private Boolean isDigiLockerVerified = false;

    private Integer version = 1;

    private LocalDateTime uploadedAt = LocalDateTime.now();

    public Document() {
    }

    public Document(Applicant applicant, DocumentType documentType, String fileName,
                    String fileType, Long fileSize, String fileData, String fileHash) {
        this.applicant = applicant;
        this.documentType = documentType;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.fileData = fileData;
        this.fileHash = fileHash;
        this.verificationStatus = VerificationStatus.PENDING;
        this.uploadedAt = LocalDateTime.now();
        this.version = 1;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Applicant getApplicant() { return applicant; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFileData() { return fileData; }
    public void setFileData(String fileData) { this.fileData = fileData; }

    public String getFileHash() { return fileHash; }
    public void setFileHash(String fileHash) { this.fileHash = fileHash; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    @Transient
    @JsonProperty("status")
    public VerificationStatus getStatus() {
        return verificationStatus;
    }

    public void setStatus(VerificationStatus status) {
        this.verificationStatus = status;
    }

    @Transient
    @JsonProperty("sha256Hash")
    public String getSha256Hash() {
        return fileHash;
    }

    public String getRemarks() { return remarks; }

    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public Boolean getIsDigiLockerVerified() { return isDigiLockerVerified; }
    public void setIsDigiLockerVerified(Boolean isDigiLockerVerified) { this.isDigiLockerVerified = isDigiLockerVerified; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}

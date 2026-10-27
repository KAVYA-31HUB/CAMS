package com.examly.springapp.dto;

import com.examly.springapp.entity.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DocumentUploadDto {

    @NotNull(message = "Applicant ID is required")
    private Long applicantId;

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    @NotBlank(message = "File name is required")
    private String fileName;

    private String fileType;

    private Long fileSize;

    @NotBlank(message = "File data is required")
    private String fileData;

    private Boolean isDigiLocker = false;

    public DocumentUploadDto() {
    }

    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

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

    public Boolean getIsDigiLocker() { return isDigiLocker; }
    public void setIsDigiLocker(Boolean digiLocker) { isDigiLocker = digiLocker; }
}

package com.examly.springapp.controller;

import com.examly.springapp.dto.DocumentUploadDto;
import com.examly.springapp.dto.DocumentVerificationDto;
import com.examly.springapp.entity.Document;
import com.examly.springapp.entity.DocumentType;
import com.examly.springapp.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    // POST /api/documents/upload
    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(@Valid @RequestBody DocumentUploadDto dto) {
        Document saved = documentService.uploadDocument(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/documents/applicant/{applicantId}
    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Document>> getApplicantDocuments(@PathVariable Long applicantId) {
        return ResponseEntity.ok(documentService.getDocumentsByApplicant(applicantId));
    }

    // GET /api/documents/pending - verification queue for Counsellor
    @GetMapping("/pending")
    public ResponseEntity<List<Document>> getPendingDocuments() {
        return ResponseEntity.ok(documentService.getPendingDocuments());
    }

    // GET /api/documents
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    // GET /api/documents/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    // PUT /api/documents/{id}/verify - Counsellor approve/discrepancy action
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('COUNSELLOR', 'ADMIN')")
    public ResponseEntity<Document> verifyDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentVerificationDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String counsellorEmail = auth != null ? auth.getName() : "counsellor@cams.edu";
        return ResponseEntity.ok(documentService.verifyDocument(id, dto, counsellorEmail));
    }


    // POST /api/documents/digilocker/import - DigiLocker boundary
    @PostMapping("/digilocker/import")
    public ResponseEntity<Document> importDigiLocker(@RequestBody Map<String, String> body) {
        Long applicantId = Long.valueOf(body.get("applicantId"));
        DocumentType type = DocumentType.valueOf(body.get("documentType"));
        String digiLockerUri = body.getOrDefault("digiLockerUri", "DL-CERT-2026");

        Document doc = documentService.importFromDigiLocker(applicantId, type, digiLockerUri);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }
}

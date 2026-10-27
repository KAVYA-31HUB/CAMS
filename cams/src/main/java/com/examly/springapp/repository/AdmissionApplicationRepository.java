package com.examly.springapp.repository;

import com.examly.springapp.entity.AdmissionApplication;
import com.examly.springapp.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, Long> {

    boolean existsByApplicant_IdAndProgramme_Id(Long applicantId, Long programmeId);

    List<AdmissionApplication> findByApplicant_Id(Long applicantId);

    List<AdmissionApplication> findByProgramme_Id(Long programmeId);

    List<AdmissionApplication> findByProgramme_IdAndApplicant_Category(Long programmeId, String category);

    Optional<AdmissionApplication> findByApplicationNumber(String applicationNumber);

    List<AdmissionApplication> findByStatus(ApplicationStatus status);

    List<AdmissionApplication> findByProgramme_IdAndStatus(Long programmeId, ApplicationStatus status);

    List<AdmissionApplication> findByProgramme_IdAndApplicant_CategoryAndStatus(Long programmeId, String category, ApplicationStatus status);

    long countByStatus(ApplicationStatus status);

    long countByProgramme_Id(Long programmeId);

    boolean existsByApplicant_AadhaarHashAndAcademicYear(String aadhaarHash, String academicYear);
}

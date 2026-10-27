package com.examly.springapp.repository;

import com.examly.springapp.entity.Scholarship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {
    List<Scholarship> findByApplicant_Id(Long applicantId);
    List<Scholarship> findByStatus(Scholarship.ScholarshipStatus status);
    long countByStatus(Scholarship.ScholarshipStatus status);

    @Query("SELECT COALESCE(SUM(s.approvedAmount), 0.0) FROM Scholarship s WHERE s.status = 'APPROVED'")
    Double getTotalApprovedScholarships();
}

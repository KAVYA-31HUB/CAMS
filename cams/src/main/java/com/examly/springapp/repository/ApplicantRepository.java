package com.examly.springapp.repository;

import com.examly.springapp.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    boolean existsByEmail(String email);
    Optional<Applicant> findByEmail(String email);
    boolean existsByAadhaarHash(String aadhaarHash);
    Optional<Applicant> findByUser_Id(Long userId);
    default Optional<Applicant> findByUserId(Long userId) {
        return findByUser_Id(userId);
    }
}

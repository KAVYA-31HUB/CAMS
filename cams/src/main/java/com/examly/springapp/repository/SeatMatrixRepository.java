package com.examly.springapp.repository;

import com.examly.springapp.entity.SeatMatrix;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatMatrixRepository extends JpaRepository<SeatMatrix, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SeatMatrix s WHERE s.id = :id")
    Optional<SeatMatrix> findByIdForUpdate(@Param("id") Long id);

    List<SeatMatrix> findByProgramme_Id(Long programmeId);

    List<SeatMatrix> findByProgramme_IdAndRoundNoAndAcademicYear(Long programmeId, Integer roundNo, String academicYear);

    List<SeatMatrix> findByRoundNoAndAcademicYear(Integer roundNo, String academicYear);

    List<SeatMatrix> findByAcademicYear(String academicYear);

    Optional<SeatMatrix> findByProgramme_IdAndQuotaAndRoundNoAndAcademicYear(Long programmeId, String quota, Integer roundNo, String academicYear);
}

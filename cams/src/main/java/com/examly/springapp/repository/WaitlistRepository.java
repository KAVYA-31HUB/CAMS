package com.examly.springapp.repository;

import com.examly.springapp.entity.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByProgramme_IdAndQuotaAndStatusOrderByRankPositionAsc(Long programmeId, String quota, WaitlistEntry.WaitlistStatus status);
    List<WaitlistEntry> findByProgramme_IdAndStatusOrderByRankPositionAsc(Long programmeId, WaitlistEntry.WaitlistStatus status);
    List<WaitlistEntry> findByApplication_Id(Long applicationId);
    Optional<WaitlistEntry> findFirstByProgramme_IdAndQuotaAndStatusOrderByRankPositionAsc(Long programmeId, String quota, WaitlistEntry.WaitlistStatus status);
}

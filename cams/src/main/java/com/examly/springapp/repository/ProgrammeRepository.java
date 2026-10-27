package com.examly.springapp.repository;

import com.examly.springapp.entity.Programme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgrammeRepository extends JpaRepository<Programme, Long> {
    List<Programme> findByIsActiveTrue();
    Optional<Programme> findByCode(String code);
    boolean existsByName(String name);
}

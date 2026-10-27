package com.examly.springapp.service;

import com.examly.springapp.entity.Programme;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.ProgrammeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgrammeService {

    @Autowired
    private ProgrammeRepository programmeRepository;

    public Programme createProgramme(Programme programme) {
        if (programme.getMeritFormula() == null || programme.getMeritFormula().isBlank()) {
            programme.setMeritFormula("{\"boardWeight\":0.4,\"entranceWeight\":0.6,\"tieBreaker\":\"ENTRANCE_FIRST\"}");
        }
        return programmeRepository.save(programme);
    }

    public List<Programme> getAllProgrammes() {
        return programmeRepository.findAll();
    }

    public List<Programme> getActiveProgrammes() {
        return programmeRepository.findByIsActiveTrue();
    }

    public Programme getProgrammeById(Long id) {
        return programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme not found with id: " + id));
    }

    public Programme updateProgramme(Long id, Programme updated) {
        Programme existing = getProgrammeById(id);
        existing.setName(updated.getName());
        existing.setDepartment(updated.getDepartment());
        existing.setIntakeCapacity(updated.getIntakeCapacity());
        existing.setDurationYears(updated.getDurationYears());
        existing.setIsActive(updated.getIsActive());

        if (updated.getCode() != null) existing.setCode(updated.getCode());
        if (updated.getMeritFormula() != null) existing.setMeritFormula(updated.getMeritFormula());
        if (updated.getTuitionFee() != null) existing.setTuitionFee(updated.getTuitionFee());
        if (updated.getOtherFee() != null) existing.setOtherFee(updated.getOtherFee());

        return programmeRepository.save(existing);
    }

    public Programme updateMeritFormula(Long id, String meritFormulaJson) {
        Programme existing = getProgrammeById(id);
        existing.setMeritFormula(meritFormulaJson);
        return programmeRepository.save(existing);
    }

    public void deleteProgramme(Long id) {
        Programme existing = getProgrammeById(id);
        programmeRepository.delete(existing);
    }
}

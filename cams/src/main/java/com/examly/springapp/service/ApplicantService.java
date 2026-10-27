package com.examly.springapp.service;

import com.examly.springapp.entity.Applicant;
import com.examly.springapp.exception.InvalidNameException;
import com.examly.springapp.exception.InvalidPhoneException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.ApplicantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicantService {

    @Autowired
    private ApplicantRepository applicantRepository;

    public Applicant createApplicant(Applicant applicant) {
        validateNameAndPhone(applicant.getName(), applicant.getPhone());

        if (applicantRepository.existsByEmail(applicant.getEmail())) {
            throw new IllegalStateException("This email is already registered");
        }
        return applicantRepository.save(applicant);
    }

    public List<Applicant> getAllApplicants() {
        return applicantRepository.findAll();
    }

    public Applicant getApplicantById(Long id) {
        return applicantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found with id: " + id));
    }

    public Optional<Applicant> getApplicantByUserId(Long userId) {
        return applicantRepository.findByUser_Id(userId);
    }

    public Applicant updateApplicant(Long id, Applicant updated) {
        validateNameAndPhone(updated.getName(), updated.getPhone());

        Applicant existing = getApplicantById(id);
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setCategory(updated.getCategory());
        existing.setBoardPercentage(updated.getBoardPercentage());
        existing.setEntranceScore(updated.getEntranceScore());

        if (updated.getDateOfBirth() != null) existing.setDateOfBirth(updated.getDateOfBirth());
        if (updated.getGender() != null) existing.setGender(updated.getGender());
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getSchoolBoard() != null) existing.setSchoolBoard(updated.getSchoolBoard());
        if (updated.getEntranceExamName() != null) existing.setEntranceExamName(updated.getEntranceExamName());
        if (updated.getEntranceRollNo() != null) existing.setEntranceRollNo(updated.getEntranceRollNo());

        return applicantRepository.save(existing);
    }

    public void deleteApplicant(Long id) {
        Applicant existing = getApplicantById(id);
        applicantRepository.delete(existing);
    }

    private void validateNameAndPhone(String name, String phone) {
        if (name == null || !name.matches("^[a-zA-Z ]{2,100}$")) {
            throw new InvalidNameException("Name must not contain numbers or special characters");
        }
        if (phone == null || !phone.matches("^[0-9]{10}$")) {
            throw new InvalidPhoneException("Phone Number must be exactly 10 digits long");
        }
    }
}

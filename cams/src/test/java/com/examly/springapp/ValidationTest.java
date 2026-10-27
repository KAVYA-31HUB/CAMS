package com.examly.springapp;

import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.entity.Applicant;
import com.examly.springapp.exception.InvalidNameException;
import com.examly.springapp.exception.InvalidPhoneException;
import com.examly.springapp.service.ApplicantService;
import com.examly.springapp.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ValidationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private ApplicantService applicantService;

    @Test
    public void testInvalidNameThrowsInvalidNameException() {
        RegisterRequest req = new RegisterRequest();
        req.setName("John123!@#"); // Contains digits and symbols
        req.setEmail("badname@test.com");
        req.setPhone("9876543210");
        req.setPassword("Secure@1234");

        InvalidNameException ex = assertThrows(InvalidNameException.class, () -> authService.register(req));
        assertEquals("Name must not contain numbers or special characters", ex.getMessage());
    }

    @Test
    public void testInvalidPhoneThrowsInvalidPhoneException() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Valid Name");
        req.setEmail("badphone@test.com");
        req.setPhone("12345"); // Not 10 digits
        req.setPassword("Secure@1234");

        InvalidPhoneException ex = assertThrows(InvalidPhoneException.class, () -> authService.register(req));
        assertEquals("Phone Number must be exactly 10 digits long", ex.getMessage());
    }

    @Test
    public void testApplicantServiceValidation() {
        Applicant applicant = new Applicant("Jane Doe 99", "jane99@test.com", "9876543210", "GEN", 85.0, 90.0);
        assertThrows(InvalidNameException.class, () -> applicantService.createApplicant(applicant));

        Applicant applicant2 = new Applicant("Jane Doe", "jane@test.com", "98765", "GEN", 85.0, 90.0);
        assertThrows(InvalidPhoneException.class, () -> applicantService.createApplicant(applicant2));
    }
}

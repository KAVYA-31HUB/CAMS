package com.examly.springapp;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testApplicantRegistrationAndLogin() {
        String testEmail = "test_applicant_" + System.currentTimeMillis() + "@test.com";

        RegisterRequest regReq = new RegisterRequest();
        regReq.setName("Rohit Sharma");
        regReq.setEmail(testEmail);
        regReq.setPhone("9876543210");
        regReq.setPassword("Secure@Pass123");
        regReq.setRole(Role.APPLICANT);
        regReq.setCategory("OBC");
        regReq.setBoardPercentage(89.5);
        regReq.setEntranceScore(91.0);

        LoginResponse regResp = authService.register(regReq);
        assertNotNull(regResp);
        assertNotNull(regResp.getToken());
        assertEquals(Role.APPLICANT, regResp.getRole());
        assertNotNull(regResp.getApplicantId());

        // Login with same credentials
        LoginRequest loginReq = new LoginRequest(testEmail, "Secure@Pass123");
        LoginResponse loginResp = authService.login(loginReq);
        assertNotNull(loginResp);
        assertNotNull(loginResp.getToken());
        assertEquals(testEmail, loginResp.getEmail());
    }

    @Test
    public void testDuplicateEmailRegistrationThrowsException() {
        String testEmail = "dup_user_" + System.currentTimeMillis() + "@test.com";

        RegisterRequest req1 = new RegisterRequest();
        req1.setName("User One");
        req1.setEmail(testEmail);
        req1.setPhone("9876543210");
        req1.setPassword("Secure@Pass123");
        authService.register(req1);

        RegisterRequest req2 = new RegisterRequest();
        req2.setName("User Two");
        req2.setEmail(testEmail);
        req2.setPhone("9876543211");
        req2.setPassword("Secure@Pass123");

        assertThrows(IllegalStateException.class, () -> authService.register(req2));
    }

    @Test
    public void testBadCredentialsThrowsBadCredentialsException() {
        LoginRequest badLogin = new LoginRequest("nonexistent@test.com", "WrongPass@123");
        assertThrows(BadCredentialsException.class, () -> authService.login(badLogin));
    }
}

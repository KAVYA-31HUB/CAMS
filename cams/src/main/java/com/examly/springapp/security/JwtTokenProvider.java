package com.examly.springapp.security;

import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long applicantExpiration;
    private final long staffExpiration;
    private final long adminExpiration;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    public JwtTokenProvider(
            @Value("${jwt.secret:camsSecretKeyForCollegeAdmissionManagementSystem2026SecureMustBe256BitsMinimum!}") String secret,
            @Value("${jwt.expiration.applicant:28800000}") long applicantExpiration,
            @Value("${jwt.expiration.staff:43200000}") long staffExpiration,
            @Value("${jwt.expiration.admin:86400000}") long adminExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.applicantExpiration = applicantExpiration;
        this.staffExpiration = staffExpiration;
        this.adminExpiration = adminExpiration;
    }

    public String generateToken(User user) {
        long expiryMs = getExpirationForRole(user.getRole());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiryMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("fullName", user.getFullName())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    private long getExpirationForRole(Role role) {
        if (role == null) return applicantExpiration;
        return switch (role) {
            case ADMIN, ADMINISTRATOR -> adminExpiration;
            case APPLICANT -> applicantExpiration;
            default -> staffExpiration; // COUNSELLOR, COORDINATOR, PROGRAMME_COORDINATOR, REGISTRAR, FINANCE, FINANCE_OFFICER
        };
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getEmailFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return getClaimsFromToken(token).get("role", String.class);
    }

    public Long getUserIdFromToken(String token) {
        Object id = getClaimsFromToken(token).get("userId");
        if (id instanceof Integer) {
            return ((Integer) id).longValue();
        } else if (id instanceof Long) {
            return (Long) id;
        }
        return Long.valueOf(id.toString());
    }

    public boolean validateToken(String token) {
        if (tokenBlacklistService.isBlacklisted(token)) {
            return false;
        }
        try {
            Claims claims = getClaimsFromToken(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

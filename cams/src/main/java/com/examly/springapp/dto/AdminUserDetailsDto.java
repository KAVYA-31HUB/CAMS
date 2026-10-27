package com.examly.springapp.dto;

import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;

import java.time.LocalDateTime;
import java.util.Map;

public class AdminUserDetailsDto {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private Map<String, Object> roleDetails;

    public AdminUserDetailsDto() {
    }

    public AdminUserDetailsDto(User user, Map<String, Object> roleDetails) {
        if (user != null) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.phone = user.getPhone();
            this.role = user.getRole();
            this.isActive = user.getIsActive();
            this.createdAt = user.getCreatedAt();
            this.lastLoginAt = user.getLastLoginAt();
        }
        this.roleDetails = roleDetails;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public Map<String, Object> getRoleDetails() { return roleDetails; }
    public void setRoleDetails(Map<String, Object> roleDetails) { this.roleDetails = roleDetails; }
}

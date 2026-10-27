package com.examly.springapp.dto;

import com.examly.springapp.entity.Role;
import jakarta.validation.constraints.*;

public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^[a-zA-Z ]{2,100}$", message = "Name must not contain numbers or special characters")
    private String name;

    @NotBlank(message = "Please enter a valid email address")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone Number must be exactly 10 digits long")
    private String phone;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must meet security requirements"
    )
    private String password;

    private Role role = Role.APPLICANT;

    // Applicant-specific fields (optional for staff registration)
    private String category = "GEN";

    @DecimalMin(value = "0.0", message = "Board percentage must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Board percentage must be between 0 and 100")
    private Double boardPercentage = 0.0;

    @PositiveOrZero(message = "Entrance score must be a non-negative number")
    private Double entranceScore = 0.0;

    private String aadhaarNumber;

    private String dateOfBirth;

    private String gender;

    private String address;

    private String schoolBoard;

    private String entranceExamName;

    private String entranceRollNo;

    // Staff registration check
    private String employeeId;

    public RegisterRequest() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getBoardPercentage() { return boardPercentage; }
    public void setBoardPercentage(Double boardPercentage) { this.boardPercentage = boardPercentage; }

    public Double getEntranceScore() { return entranceScore; }
    public void setEntranceScore(Double entranceScore) { this.entranceScore = entranceScore; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getSchoolBoard() { return schoolBoard; }
    public void setSchoolBoard(String schoolBoard) { this.schoolBoard = schoolBoard; }

    public String getEntranceExamName() { return entranceExamName; }
    public void setEntranceExamName(String entranceExamName) { this.entranceExamName = entranceExamName; }

    public String getEntranceRollNo() { return entranceRollNo; }
    public void setEntranceRollNo(String entranceRollNo) { this.entranceRollNo = entranceRollNo; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
}

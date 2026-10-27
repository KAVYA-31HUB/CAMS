package com.examly.springapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "applicants")
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^[a-zA-Z ]{2,100}$", message = "Name must not contain numbers or special characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone Number must be exactly 10 digits long")
    @Column(nullable = false)
    private String phone;

    // GEN, OBC, SC, ST, EWS, SPORTS, DEFENCE
    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @NotNull(message = "Board percentage is required")
    @DecimalMin(value = "0.0", message = "Board percentage must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Board percentage must be between 0 and 100")
    private Double boardPercentage;

    @NotNull(message = "Entrance score is required")
    @PositiveOrZero(message = "Entrance score must be a non-negative number")
    private Double entranceScore;

    // Additional fields per SRS
    private String aadhaarHash;

    private String dateOfBirth;

    private String gender;

    @Column(length = 500)
    private String address;

    private String schoolBoard;

    private String entranceExamName;

    private String entranceRollNo;

    public Applicant() {
    }

    public Applicant(String name, String email, String phone, String category,
                      Double boardPercentage, Double entranceScore) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.category = category;
        this.boardPercentage = boardPercentage;
        this.entranceScore = entranceScore;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getBoardPercentage() { return boardPercentage; }
    public void setBoardPercentage(Double boardPercentage) { this.boardPercentage = boardPercentage; }

    public Double getEntranceScore() { return entranceScore; }
    public void setEntranceScore(Double entranceScore) { this.entranceScore = entranceScore; }

    public String getAadhaarHash() { return aadhaarHash; }
    public void setAadhaarHash(String aadhaarHash) { this.aadhaarHash = aadhaarHash; }

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
}

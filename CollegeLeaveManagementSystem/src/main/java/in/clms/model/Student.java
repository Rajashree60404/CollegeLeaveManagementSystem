package in.clms.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@NoArgsConstructor
@Data
@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long registerNo;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable=true)
    private String password;
   
    @Column(name = "phone_number", nullable = false, unique = true)
    private Long phoneNumber;

    @Column(name = "parent_email")
    private String parentEmail;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<LeaveRequest> leaveRequests = new ArrayList<>();

    @Column(name = "otp")
    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @Column(name = "password_set")
    private boolean passwordSet;
    
    @Column(name = "profile_image_url", length = 1000)
    private String profileImageUrl;

    @Column(name = "profile_image_public_id", length = 500)
    private String profileImagePublicId;
    
}

   

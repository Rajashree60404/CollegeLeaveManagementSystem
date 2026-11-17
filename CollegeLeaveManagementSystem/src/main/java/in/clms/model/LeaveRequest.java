package in.clms.model;

import java.time.LocalDate;

import in.clms.enums.LeaveStatus;
import in.clms.enums.LeaveType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(nullable = false)
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", length = 20)
    private LeaveType leaveType=LeaveType.NORMAL;

    @Column(name = "medical_file")
    private String medicalFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "parent_status", nullable = false)
    private LeaveStatus parentStatus = LeaveStatus.PENDING;

    
    @Enumerated(EnumType.STRING)
    @Column(name = "staff_status", nullable = false)
    private LeaveStatus staffStatus = LeaveStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status = LeaveStatus.PENDING;

 
}
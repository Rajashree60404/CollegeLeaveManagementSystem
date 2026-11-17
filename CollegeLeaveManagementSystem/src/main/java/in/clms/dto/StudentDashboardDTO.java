package in.clms.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentDashboardDTO {

    private Long studentId;
    private String studentName;

    private int totalAllowedLeaves;
    private int leavesTaken;
    private int leavesRemaining;

    private String status;
}
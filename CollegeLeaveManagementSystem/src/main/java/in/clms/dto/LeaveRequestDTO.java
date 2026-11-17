package in.clms.dto;

import java.time.LocalDate;

import in.clms.enums.LeaveStatus;
import in.clms.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LeaveRequestDTO {

	private Long id;

	private String studentName;

	private Long registerNo;

	private Long studentId;

	private Long staffId;

	private LocalDate fromDate;

	private LocalDate toDate;

	private String reason;

	private LeaveType leaveType;

	private String medicalFile;

	private LeaveStatus parentStatus;

	private LeaveStatus staffStatus;

	private LeaveStatus status;

}
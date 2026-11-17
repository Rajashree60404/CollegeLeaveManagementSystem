package in.clms.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import in.clms.dto.LeaveRequestDTO;
import in.clms.model.LeaveRequest;

public interface LeaveRequestService {

	LeaveRequestDTO applyLeave(LeaveRequestDTO leaveRequestDTO, MultipartFile medicalFile);

	LeaveRequestDTO getLeaveById(Long id);

	List<LeaveRequestDTO> getAllLeaves();

	List<LeaveRequestDTO> getLeavesByStudentId(Long studentId);

	LeaveRequestDTO parentApprove(Long id);

	LeaveRequestDTO parentReject(Long id);

	LeaveRequestDTO approve(Long id);

	LeaveRequestDTO reject(Long id);
	
	String getMedicalFilePath(Long id);
}

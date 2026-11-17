package in.clms.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import java.nio.file.Path;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.clms.dto.LeaveRequestDTO;
import in.clms.enums.LeaveStatus;
import in.clms.enums.LeaveType;
import in.clms.exception.LeaveRequestNotFoundException;
import in.clms.exception.StudentNotFoundException;
import in.clms.model.LeaveRequest;
import in.clms.model.Staff;
import in.clms.model.Student;
import in.clms.repository.LeaveRequestRepository;
import in.clms.repository.StaffsRepository;
import in.clms.repository.StudentsRepository;
import in.clms.service.EmailService;
import in.clms.service.LeaveRequestService;
import in.clms.service.ParentApprovalService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

	private final LeaveRequestRepository leaveRequestRepository;
	private final StudentsRepository studentsRepository;
	private final EmailService emailService;
	private final StaffsRepository staffsRepository;
	private final ParentApprovalService parentApprovalService;

	// Apply Leave

	@Override
	public LeaveRequestDTO applyLeave(LeaveRequestDTO leaveRequestDTO, MultipartFile medicalFile) {

		if (leaveRequestDTO.getFromDate() == null || leaveRequestDTO.getToDate() == null) {
			throw new IllegalArgumentException("From date and To date are required");
		}

		if (leaveRequestDTO.getToDate().isBefore(leaveRequestDTO.getFromDate())) {
			throw new IllegalArgumentException("To date cannot be before From date");
		}

		long days = ChronoUnit.DAYS.between(leaveRequestDTO.getFromDate(), leaveRequestDTO.getToDate()) + 1;

		LeaveType leaveType = leaveRequestDTO.getLeaveType();

		if (leaveType == null) {
			leaveType = LeaveType.NORMAL;
		}

		String filePath = null;

		if (days > 7) {
			if (medicalFile == null || medicalFile.isEmpty()) {
				throw new IllegalArgumentException("Medical certificate is mandatory for leave exceeding 7 days");
			}

			filePath = saveMedicalFile(medicalFile);
		}

		Student student = studentsRepository.findById(leaveRequestDTO.getStudentId())
				.orElseThrow(() -> new IllegalArgumentException("Student not found"));

		// Calculate normal leave balance
		int totalAllowedLeaves = 7;
		int leavesTaken = 0;

		for (LeaveRequest leave : student.getLeaveRequests()) {

			boolean isNormalLeave = leave.getLeaveType() == null || leave.getLeaveType() == LeaveType.NORMAL;

			if (leave.getStatus() == LeaveStatus.APPROVED && isNormalLeave) {

				long approvedDays = ChronoUnit.DAYS.between(leave.getFromDate(), leave.getToDate()) + 1;

				leavesTaken += (int) approvedDays;
			}
		}

		int leavesRemaining = totalAllowedLeaves - leavesTaken;

		// Check leave balance only for NORMAL leave
		if (leaveType == LeaveType.NORMAL && days > leavesRemaining) {

			throw new IllegalArgumentException("Insufficient leave balance. Only " + leavesRemaining
					+ " leave days remaining. Select Emergency Leave if applicable.");
		}

		// Assign staff based on student department
		Staff staff = staffsRepository.findFirstByDepartment(student.getDepartment()).orElseThrow(
				() -> new IllegalArgumentException("No staff found for department: " + student.getDepartment()));

		// Create leave request
		LeaveRequest leaveRequest = new LeaveRequest();

		leaveRequest.setStudent(student);
		leaveRequest.setStaff(staff);
		leaveRequest.setFromDate(leaveRequestDTO.getFromDate());
		leaveRequest.setToDate(leaveRequestDTO.getToDate());
		leaveRequest.setReason(leaveRequestDTO.getReason());
		leaveRequest.setLeaveType(leaveType);
		leaveRequest.setMedicalFile(filePath);

		// Keep approval statuses pending
		leaveRequest.setParentStatus(LeaveStatus.PENDING);
		leaveRequest.setStaffStatus(LeaveStatus.PENDING);
		leaveRequest.setStatus(LeaveStatus.PENDING);

		// Save leave request
		LeaveRequest savedLeave = leaveRequestRepository.save(leaveRequest);

		// Send existing leave application email to parent
		if (student.getParentEmail() != null && !student.getParentEmail().isBlank()) {

			String token = parentApprovalService.generateToken(savedLeave.getId());

			emailService.sendLeaveApplicationEmail(student.getParentEmail(), student.getName(), savedLeave.getId(),
					savedLeave.getFromDate().toString(), savedLeave.getToDate().toString(), savedLeave.getReason(),
					token);
		}

		// Return saved leave request
		return convertToDTO(savedLeave);
	}

	private String saveMedicalFile(MultipartFile medicalFile) {

		try {

			String uploadDirectory = "uploads/medical-certificates";

			Path uploadPath = Paths.get(uploadDirectory);

			// Create directory if it doesnt exist
			if (!Files.exists(uploadPath)) {

				Files.createDirectories(uploadPath);
			}

			// Original file name
			String originalFileName = medicalFile.getOriginalFilename();

			// Create unique file name
			String fileName = UUID.randomUUID() + "_" + originalFileName;

			Path filePath = uploadPath.resolve(fileName);

			// Save file
			Files.copy(medicalFile.getInputStream(), filePath);

			return filePath.toString();

		} catch (IOException e) {

			throw new RuntimeException("Failed to upload medical certificate");
		}
	}

	// Get Leave By ID
	@Override
	public LeaveRequestDTO getLeaveById(Long id) {

		LeaveRequest leave = leaveRequestRepository.findById(id)
				.orElseThrow(() -> new LeaveRequestNotFoundException("Leave request not found with ID: " + id));

		return convertToDTO(leave);
	}

	// Get All Leaves
	@Override
	public List<LeaveRequestDTO> getAllLeaves() {

		return leaveRequestRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
	}

	// Student Leave History
	@Override
	public List<LeaveRequestDTO> getLeavesByStudentId(Long studentId) {

		if (!studentsRepository.existsById(studentId)) {

			throw new StudentNotFoundException("Student not found with ID: " + studentId);
		}

		return leaveRequestRepository.findByStudentId(studentId).stream().map(this::convertToDTO)
				.collect(Collectors.toList());
	}

	// Staff Approve

	@Override
	public LeaveRequestDTO approve(Long id) {

		LeaveRequest leave = leaveRequestRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

		// Parent must approve first
		if (leave.getParentStatus() != LeaveStatus.APPROVED) {
			throw new IllegalArgumentException("Leave cannot be approved by staff before parent approval");
		}

		// Staff approval
		leave.setStaffStatus(LeaveStatus.APPROVED);
		leave.setStatus(LeaveStatus.APPROVED);

		LeaveRequest updatedLeave = leaveRequestRepository.save(leave);

		// Send final approval email to student
		if (updatedLeave.getStudent() != null && updatedLeave.getStudent().getEmail() != null
				&& !updatedLeave.getStudent().getEmail().isEmpty()) {

			emailService.sendStaffFinalApprovalEmail(updatedLeave.getStudent().getEmail(),
					updatedLeave.getStudent().getName(), updatedLeave.getId(), updatedLeave.getFromDate().toString(),
					updatedLeave.getToDate().toString(), updatedLeave.getReason());
		}

		System.out.println("Student Email: " + updatedLeave.getStudent().getEmail());

		return convertToDTO(updatedLeave);
	}

	// Staff Reject

	@Override
	public LeaveRequestDTO reject(Long id) {

		LeaveRequest leave = leaveRequestRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

		if (leave.getParentStatus() != LeaveStatus.APPROVED) {
			throw new IllegalStateException("Staff cannot reject the leave before parent approval");
		}

		// Staff rejection
		leave.setStaffStatus(LeaveStatus.REJECTED);
		leave.setStatus(LeaveStatus.REJECTED);

		leaveRequestRepository.save(leave);

		// Send rejection email to parent
		if (leave.getStudent() != null && leave.getStudent().getParentEmail() != null
				&& !leave.getStudent().getParentEmail().isEmpty()) {

			emailService.sendStaffRejectionEmail(leave.getStudent().getParentEmail(), leave.getStudent().getName(),
					leave.getId(), leave.getFromDate().toString(), leave.getToDate().toString(), leave.getReason());
		}

		return convertToDTO(leave);
	}

	// Parent Approve
	@Override
	public LeaveRequestDTO parentApprove(Long id) {

		LeaveRequest leave = getEntityById(id);

		if (leave.getStatus() == LeaveStatus.REJECTED) {
			throw new IllegalArgumentException("Rejected leave cannot be approved");
		}

		leave.setParentStatus(LeaveStatus.APPROVED);
		leave.setStatus(LeaveStatus.PENDING);

		LeaveRequest updatedLeave = leaveRequestRepository.save(leave);

		// Send email to assigned staff
		if (leave.getStaff() != null && leave.getStaff().getEmail() != null && !leave.getStaff().getEmail().isEmpty()) {

			emailService.sendStaffLeaveApprovalEmail(leave.getStaff().getEmail(), leave.getStaff().getName(),
					leave.getStudent().getName(), leave.getId(), leave.getFromDate().toString(),
					leave.getToDate().toString(), leave.getReason());
		}

		return convertToDTO(updatedLeave);
	}

	// Parent Reject
	@Override
	public LeaveRequestDTO parentReject(Long id) {

		LeaveRequest leave = getEntityById(id);

		leave.setParentStatus(LeaveStatus.REJECTED);
		leave.setStaffStatus(LeaveStatus.PENDING);
		leave.setStatus(LeaveStatus.REJECTED);

		LeaveRequest updatedLeave = leaveRequestRepository.save(leave);

		if (leave.getStaff() != null && leave.getStaff().getEmail() != null && !leave.getStaff().getEmail().isEmpty()) {

			emailService.sendStaffLeaveApprovalEmail(leave.getStaff().getEmail(), leave.getStaff().getName(),
					leave.getStudent().getName(), leave.getId(), leave.getFromDate().toString(),
					leave.getToDate().toString(), leave.getReason());
		}

		return convertToDTO(updatedLeave);
	}

	// Find Entity
	private LeaveRequest getEntityById(Long id) {

		return leaveRequestRepository.findById(id)
				.orElseThrow(() -> new LeaveRequestNotFoundException("Leave request not found with ID: " + id));
	}

	// Entity to DTO
	private LeaveRequestDTO convertToDTO(LeaveRequest leave) {

		LeaveRequestDTO dto = new LeaveRequestDTO();

		dto.setId(leave.getId());

		if (leave.getStudent() != null) {
			dto.setStudentId(leave.getStudent().getId());
			dto.setStudentName(leave.getStudent().getName());
			dto.setRegisterNo(leave.getStudent().getRegisterNo());
		}

		if (leave.getStaff() != null) {
			dto.setStaffId(leave.getStaff().getId());
		}

		dto.setFromDate(leave.getFromDate());
		dto.setToDate(leave.getToDate());
		dto.setReason(leave.getReason());
		dto.setLeaveType(leave.getLeaveType());
		dto.setMedicalFile(leave.getMedicalFile());
		dto.setParentStatus(leave.getParentStatus());
		dto.setStaffStatus(leave.getStaffStatus());
		dto.setStatus(leave.getStatus());

		return dto;
	}

	@Override
	public String getMedicalFilePath(Long id) {

		LeaveRequest leave = leaveRequestRepository.findById(id)
				.orElseThrow(() -> new LeaveRequestNotFoundException("Leave request not found with ID: " + id));

		String filePath = leave.getMedicalFile();

		if (filePath == null || filePath.isBlank()) {
			throw new IllegalArgumentException("No medical file is attached to this leave request");
		}

		Path path = Paths.get(filePath);

		if (!Files.exists(path) || !Files.isRegularFile(path)) {
			throw new IllegalArgumentException("Medical file was not found on the server");
		}

		return path.toAbsolutePath().toString();
	}

}
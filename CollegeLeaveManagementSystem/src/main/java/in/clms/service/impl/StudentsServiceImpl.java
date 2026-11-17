
package in.clms.service.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import in.clms.dto.ForgotPasswordDTO;
import in.clms.dto.LoginDTO;
import in.clms.dto.RegisterStudentDTO;
import in.clms.dto.ResetPasswordDTO;
import in.clms.dto.SetPasswordDTO;
import in.clms.dto.StaffRegisterStudentDTO;
import in.clms.dto.StudentDTO;
import in.clms.dto.StudentDashboardDTO;
import in.clms.dto.StudentProfileDTO;
import in.clms.dto.StudentProfileImageDTO;
import in.clms.dto.VerifyOtpDTO;
import in.clms.enums.LeaveStatus;
import in.clms.exception.StaffNotFoundException;
import in.clms.exception.StudentNotFoundException;
import in.clms.model.LeaveRequest;
import in.clms.model.Staff;
import in.clms.model.Student;
import in.clms.repository.StudentsRepository;
import in.clms.service.EmailService;
import in.clms.service.ICloudinaryService;
import in.clms.service.StudentsService;
import in.clms.util.JwtUtil;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentsServiceImpl implements StudentsService {

	private final ICloudinaryService cloudinaryService;
	private final PasswordEncoder passwordEncoder;
	private final StudentsRepository studentsRepository;
	private final EmailService emailService;

	@Autowired
	private JwtUtil jwtutil;

	private final SecureRandom secureRandom = new SecureRandom();

// Student registration 
	@Override
	public StudentDTO addStudent(RegisterStudentDTO dto) {

		if (dto == null) {
			throw new IllegalArgumentException("All details are required");
		}

		if (dto.getName() == null || dto.getName().isBlank()) {
			throw new IllegalArgumentException("Name is required");
		}

		if (dto.getDepartment() == null || dto.getDepartment().isBlank()) {
			throw new IllegalArgumentException("Department is required");
		}

		validateEmail(dto.getEmail());
		validatePassword(dto.getPassword());

		if (dto.getPhoneNumber() == null || !String.valueOf(dto.getPhoneNumber()).matches("^[0-9]{10}$")) {
			throw new IllegalArgumentException("Phone number must contain exactly 10 digits");
		}

		if (studentsRepository.existsByEmail(dto.getEmail().trim())) {
			throw new IllegalArgumentException("Email already registered");
		}

		if (studentsRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
			throw new IllegalArgumentException("Phone number already registered");
		}

		Student student = new Student();

		student.setRegisterNo(dto.getRegisterNo());
		student.setName(dto.getName().trim());
		student.setDepartment(dto.getDepartment().trim());
		student.setEmail(dto.getEmail().trim());
		student.setPassword(passwordEncoder.encode(dto.getPassword()));
		student.setPhoneNumber(dto.getPhoneNumber());
		student.setParentEmail(dto.getParentEmail());
		student.setPasswordSet(true);

		Student savedStudent = studentsRepository.save(student);

		return convertToDTO(savedStudent);
	}
// Student login.

	@Override
	public StudentDTO login(LoginDTO dto) {

		if (dto == null) {
			throw new IllegalArgumentException("Login details are required");
		}

		validateEmail(dto.getEmail());

		if (dto.getPassword() == null || dto.getPassword().isBlank()) {
			throw new IllegalArgumentException("Password is required");
		}

		Student student = studentsRepository.findByEmail(dto.getEmail().trim())
				.orElseThrow(() -> new StudentNotFoundException("Invalid email or password"));

		if (!student.isPasswordSet() || student.getPassword() == null || student.getPassword().isBlank()) {

			throw new IllegalArgumentException("Password not set. Please activate your account first");
		}

		if (!passwordEncoder.matches(dto.getPassword(), student.getPassword())) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		// Generate JWT after successful authentication
		String token = jwtutil.generateToken(student.getEmail(), "STUDENT");

		// Convert Student entity into DTO
		StudentDTO studentDTO = convertToDTO(student);

		// Attach JWT token to response DTO
		studentDTO.setToken(token);

		return studentDTO;
	}

	// Generate a six-digit OTP.
	private String generateOtp() {
		int otp = 100000 + secureRandom.nextInt(900000);
		return String.valueOf(otp);
	}

	// Validate password rules.
	private void validatePassword(String password) {

		if (password == null || password.isBlank()) {
			throw new IllegalArgumentException("Password is required");
		}

		if (password.length() < 8) {
			throw new IllegalArgumentException("Password must contain at least 8 characters");
		}

		if (!password.matches(".*[A-Z].*")) {
			throw new IllegalArgumentException("Password must contain at least one uppercase letter");
		}

		if (!password.matches(".*[a-z].*")) {
			throw new IllegalArgumentException("Password must contain at least one lowercase letter");
		}

		if (!password.matches(".*[0-9].*")) {
			throw new IllegalArgumentException("Password must contain at least one number");
		}

		if (!password.matches(".*[^A-Za-z0-9].*")) {
			throw new IllegalArgumentException("Password must contain at least one special symbol");
		}
	}

	// Validate email format.
	private void validateEmail(String email) {

		if (email == null || !email.trim().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {

			throw new IllegalArgumentException("Please enter a valid email address");
		}
	}

	// Validate OTP and expiry.
	private void validateOtp(String storedOtp, LocalDateTime expiryTime, String enteredOtp) {

		if (enteredOtp == null || enteredOtp.isBlank()) {
			throw new IllegalArgumentException("OTP is required");
		}

		if (storedOtp == null || expiryTime == null) {
			throw new IllegalArgumentException("Please request a new OTP");
		}

		if (!LocalDateTime.now().isBefore(expiryTime)) {
			throw new IllegalArgumentException("OTP has expired. Please request a new OTP");
		}

		if (!storedOtp.equals(enteredOtp.trim())) {
			throw new IllegalArgumentException("Invalid OTP");
		}
	}

	// Get student by ID.
	@Override
	@Transactional(readOnly = true)
	public StudentDTO getStudentById(Long id) {

		Student student = studentsRepository.findById(id)
				.orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + id));

		return convertToDTO(student);
	}

	// Get all students.
	@Override
	@Transactional(readOnly = true)
	public List<StudentDTO> getAllStudents() {

		return studentsRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
	}

	// Convert entity to DTO.
	private StudentDTO convertToDTO(Student student) {

		return new StudentDTO(student.getId(), student.getRegisterNo(), student.getName(), student.getDepartment(),
				student.getEmail(), student.getPhoneNumber(), student.getParentEmail(), null);
	}

	// Forgot password: send OTP.
	@Override
	public void forgotPassword(ForgotPasswordDTO dto) {

		System.out.println("1. Forgot password method called");

		if (dto == null) {
			throw new IllegalArgumentException("Forgot-password details are required");
		}

		System.out.println("2. Email received: " + dto.getEmail());

		validateEmail(dto.getEmail());

		Student student = studentsRepository.findByEmail(dto.getEmail().trim())
				.orElseThrow(() -> new StudentNotFoundException("Student not found with this email"));

		System.out.println("3. Student found");

		String otp = generateOtp();

		student.setOtp(otp);
		student.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

		studentsRepository.save(student);

		System.out.println("4. OTP saved in database");

		emailService.sendOtp(student.getEmail(), otp);

		System.out.println("5. OTP email sent");
	}

	// Verify OTP.
	@Override
	@Transactional(readOnly = true)
	public void verifyOtp(VerifyOtpDTO dto) {

		if (dto == null) {
			throw new IllegalArgumentException("OTP verification details are required");
		}

		validateEmail(dto.getEmail());

		Student student = studentsRepository.findByEmail(dto.getEmail().trim())
				.orElseThrow(() -> new StudentNotFoundException("Student not found with this email"));

		validateOtp(student.getOtp(), student.getOtpExpiry(), dto.getOtp());
	}

	// Reset a forgotten password.
	@Override
	public void resetPassword(ResetPasswordDTO dto) {

		if (dto == null) {
			throw new IllegalArgumentException("Password reset details are required");
		}

		validateEmail(dto.getEmail());
		validatePassword(dto.getNewPassword());

		if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
			throw new IllegalArgumentException("Passwords do not match");
		}

		Student student = studentsRepository.findByEmail(dto.getEmail().trim())
				.orElseThrow(() -> new StudentNotFoundException("Student not found with this email"));

		validateOtp(student.getOtp(), student.getOtpExpiry(), dto.getOtp());

		student.setPassword(passwordEncoder.encode(dto.getNewPassword()));
		student.setPasswordSet(true);

		// Prevent OTP reuse.
		student.setOtp(null);
		student.setOtpExpiry(null);

		studentsRepository.save(student);
	}

	// Student dashboard.

	@Override
	@Transactional(readOnly = true)
	public StudentDashboardDTO getStudentDashboard(Long studentId) {

		Student student = studentsRepository.findById(studentId)
				.orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + studentId));

		int totalAllowedLeaves = 7;
		int leavesTaken = 0;

		if (student.getLeaveRequests() != null) {

			for (LeaveRequest leave : student.getLeaveRequests()) {

				if (leave.getStatus() == LeaveStatus.APPROVED) {

					long days = ChronoUnit.DAYS.between(leave.getFromDate(), leave.getToDate()) + 1;

					leavesTaken += (int) days;
				}
			}
		}

		int leavesRemaining = Math.max(0, totalAllowedLeaves - leavesTaken);

		String status = leavesRemaining == 0 ? "NO LEAVES REMAINING" : "ACTIVE";

		return new StudentDashboardDTO(student.getId(), student.getName(), totalAllowedLeaves, leavesTaken,
				leavesRemaining, status);
	}

	// Staff registers a student without setting a password.
	@Override
	public StudentDTO registerStudentByStaff(StaffRegisterStudentDTO dto) {

		if (dto == null) {
			throw new IllegalArgumentException("Student details are required");
		}

		if (dto.getName() == null || dto.getName().isBlank()) {
			throw new IllegalArgumentException("Student name is required");
		}

		if (dto.getDepartment() == null || dto.getDepartment().isBlank()) {
			throw new IllegalArgumentException("Department is required");
		}

		validateEmail(dto.getEmail());

		if (dto.getPhoneNumber() == null || !String.valueOf(dto.getPhoneNumber()).matches("^[0-9]{10}$")) {
			throw new IllegalArgumentException("Phone number must contain exactly 10 digits");
		}

		if (studentsRepository.existsByEmail(dto.getEmail().trim())) {
			throw new IllegalArgumentException("Email already registered");
		}

		if (studentsRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
			throw new IllegalArgumentException("Phone number already registered");
		}

		Student student = new Student();

		student.setRegisterNo(dto.getRegisterNo());
		student.setName(dto.getName().trim());
		student.setDepartment(dto.getDepartment().trim());
		student.setEmail(dto.getEmail().trim());
		student.setPhoneNumber(dto.getPhoneNumber());
		student.setParentEmail(dto.getParentEmail());

		// Student creates their own password later.
		student.setPassword(null);
		student.setPasswordSet(false);

		Student savedStudent = studentsRepository.save(student);

		emailService.sendStudentWelcomeEmail(savedStudent.getEmail(), savedStudent.getName());

		return convertToDTO(savedStudent);
	}

	// Send or resend the first-time password setup OTP.
	@Override
	public void sendPasswordSetupOtp(String email) {

		validateEmail(email);

		Student student = studentsRepository.findByEmail(email.trim())
				.orElseThrow(() -> new StudentNotFoundException("Student not found with this email"));

		if (student.isPasswordSet() || student.getPassword() != null) {
			throw new IllegalArgumentException("Password has already been set");
		}

		String otp = generateOtp();

		student.setOtp(otp);
		student.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

		studentsRepository.save(student);

		emailService.sendOtp(student.getEmail(), otp);
	}

	// Set password for the first time.

	@Override
	@Transactional
	public void setInitialPassword(SetPasswordDTO dto) {

		if (dto == null || dto.getEmail() == null || dto.getEmail().isBlank()) {
			throw new IllegalArgumentException("Email is required");
		}

		validatePassword(dto.getPassword());

		if (dto.getConfirmPassword() == null || !dto.getPassword().equals(dto.getConfirmPassword())) {
			throw new IllegalArgumentException("Password and confirm password do not match");
		}

		Student student = studentsRepository.findByEmail(dto.getEmail().trim())
				.orElseThrow(() -> new StudentNotFoundException("No student is registered with this email"));

		if (student.isPasswordSet() || (student.getPassword() != null && !student.getPassword().isBlank())) {
			throw new IllegalArgumentException("Password is already set. Please log in.");
		}

		// Store the password using the same encoder as login.
		student.setPassword(passwordEncoder.encode(dto.getPassword()));
		student.setPasswordSet(true);

		studentsRepository.save(student);
	}

	@Override
	public StudentDTO updateStudentProfile(Long id, StudentProfileDTO dto) {

		Student student = studentsRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));

		student.setName(dto.getName());
		student.setPhoneNumber(dto.getPhoneNumber());
		student.setParentEmail(dto.getParentEmail());

		Student updatedStudent = studentsRepository.save(student);

		return convertToDTO(updatedStudent);
	}

	@Override
	public void uploadProfileImage(Long id, MultipartFile image) {

		if (image == null || image.isEmpty()) {
			throw new IllegalArgumentException("Please select an image");
		}

		// Validate image type
		String contentType = image.getContentType();

		if (contentType == null || !contentType.startsWith("image/")) {
			throw new IllegalArgumentException("Only image files are allowed");
		}

		// Maximum image size: 5 MB
		if (image.getSize() > 5 * 1024 * 1024) {
			throw new IllegalArgumentException("Image size must not exceed 5 MB");
		}

		Student student = studentsRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

		try {

			Map<?, ?> result = cloudinaryService.uploadFile(image, "students");

			String imageUrl = result.get("secure_url").toString();
			String publicId = result.get("public_id").toString();

			if (result == null || result.get("secure_url") == null || result.get("public_id") == null) {
				throw new RuntimeException("Cloudinary image upload failed");
			}

			// Store Cloudinary details in MySQL
			String oldPublicId = student.getProfileImagePublicId();

			student.setProfileImageUrl(imageUrl);
			student.setProfileImagePublicId(publicId);

			studentsRepository.save(student);

			// Delete previous image after successful database save
			if (oldPublicId != null && !oldPublicId.isBlank()) {
				try {
					cloudinaryService.deleteFile(oldPublicId, "image");
				} catch (Exception e) {
					// The new image is already saved.
					// Previous image cleanup can be retried separately.
				}
			}

		} catch (IOException e) {
			throw new RuntimeException("Error uploading profile image", e);
		}
	}

	@Override
	public StudentProfileImageDTO getProfileImage(Long id) {

		Student student = studentsRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

		if (student.getProfileImageUrl() == null || student.getProfileImageUrl().isBlank()) {
			return null;
		}

		return new StudentProfileImageDTO(student.getProfileImageUrl(), student.getProfileImagePublicId());
	}

	@Override
	public void deleteProfileImage(Long id) {

		Student student = studentsRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

		String publicId = student.getProfileImagePublicId();

		if (publicId != null && !publicId.isBlank()) {
			try {
				cloudinaryService.deleteFile(publicId, "image");
			} catch (Exception e) {
				throw new RuntimeException("Unable to delete image from Cloudinary", e);
			}
		}

		student.setProfileImageUrl(null);
		student.setProfileImagePublicId(null);

		studentsRepository.save(student);
	}

}

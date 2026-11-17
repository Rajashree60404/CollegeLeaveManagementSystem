package in.clms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import in.clms.dto.ForgotPasswordDTO;
import in.clms.dto.LoginDTO;
import in.clms.dto.RegisterStudentDTO;
import in.clms.dto.ResetPasswordDTO;
import in.clms.dto.SetPasswordDTO;
import in.clms.dto.StudentDTO;
import in.clms.dto.StudentDashboardDTO;
import in.clms.dto.StudentProfileDTO;
import in.clms.dto.StudentProfileImageDTO;
import in.clms.dto.VerifyOtpDTO;
import in.clms.service.StudentsService;
import in.clms.util.ResponseStructure;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "CLMS Project", description = "Manage student leave request")
@RestController
@AllArgsConstructor
@RequestMapping("/students")
public class StudentController {

	private final StudentsService studentsService;

	// Student Registration
	@PostMapping("/register")
	public ResponseEntity<ResponseStructure<StudentDTO>> addStudent(@RequestBody RegisterStudentDTO studentDTO) {

		StudentDTO savedStudent = studentsService.addStudent(studentDTO);

		ResponseStructure<StudentDTO> response = new ResponseStructure<>(HttpStatus.CREATED.value(),
				"Student registered successfully", savedStudent);

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	// Student Login
	@PostMapping("/login")
	public ResponseEntity<ResponseStructure<StudentDTO>> login(@RequestBody LoginDTO loginDTO) {

		StudentDTO student = studentsService.login(loginDTO);

		ResponseStructure<StudentDTO> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Student login successfully", student);

		return ResponseEntity.ok(response);
	}

	// Get Student By ID
	@GetMapping("/{id}")
	public ResponseEntity<ResponseStructure<StudentDTO>> getStudentById(@PathVariable Long id) {

		StudentDTO student = studentsService.getStudentById(id);

		ResponseStructure<StudentDTO> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Student details fetched successfully", student);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<ResponseStructure<String>> forgotPassword(@RequestBody ForgotPasswordDTO dto) {

		studentsService.forgotPassword(dto);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"OTP sent successfully to your email", null);

		System.out.println("FORGOT PASSWORD CONTROLLER CALLED");
		System.out.println("Email received: " + dto.getEmail());

		return ResponseEntity.ok(response);
	}

	// Get All Students
	@GetMapping
	public ResponseEntity<ResponseStructure<List<StudentDTO>>> getAllStudents() {

		List<StudentDTO> students = studentsService.getAllStudents();

		ResponseStructure<List<StudentDTO>> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Students fetched successfully", students);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<ResponseStructure<String>> verifyOtp(@RequestBody VerifyOtpDTO dto) {

		studentsService.verifyOtp(dto);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(), "OTP Verified successfully",
				null);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ResponseStructure<String>> resetPassword(@RequestBody ResetPasswordDTO dto) {

		studentsService.resetPassword(dto);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Password reset successfully", null);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{studentId}/dashboard")
	public ResponseEntity<ResponseStructure<StudentDashboardDTO>> getStudentDashboard(@PathVariable Long studentId) {

		StudentDashboardDTO dashboard = studentsService.getStudentDashboard(studentId);

		ResponseStructure<StudentDashboardDTO> response = new ResponseStructure<>(200,
				"Student dashboard fetched successfully", dashboard);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/send-password-setup-otp")
	public ResponseEntity<ResponseStructure<String>> sendPasswordSetupOtp(@RequestParam String email) {

		studentsService.sendPasswordSetupOtp(email);

		ResponseStructure<String> response = new ResponseStructure<>();
		response.setMessage("OTP sent successfully to your email");
		response.setData("OTP sent");
		response.setStatusCode(HttpStatus.OK.value());

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/set-initial-password")
	public ResponseEntity<ResponseStructure<String>> setInitialPassword(@RequestBody SetPasswordDTO dto) {

		studentsService.setInitialPassword(dto);

		ResponseStructure<String> response = new ResponseStructure<>();
		response.setStatusCode(HttpStatus.OK.value());
		response.setMessage("Password created successfully");
		response.setData("You can now log in.");

		return ResponseEntity.ok(response);
	}

	@PutMapping("/{id}")
	public ResponseEntity<ResponseStructure<StudentDTO>> updateStudentProfile(@PathVariable Long id,
			@RequestBody StudentProfileDTO dto) {

		StudentDTO updatedStudent = studentsService.updateStudentProfile(id, dto);

		ResponseStructure<StudentDTO> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Student profile updated successfully", updatedStudent);

		return ResponseEntity.ok(response);
	}

	// Upload student profile image to Cloudinary
	@PostMapping(value = "/{id}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ResponseStructure<String>> uploadProfileImage(@PathVariable Long id,
			@RequestParam("image") MultipartFile image) {

		studentsService.uploadProfileImage(id, image);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Profile image uploaded successfully", "Image uploaded to Cloudinary");

		return ResponseEntity.ok(response);
	}

	// Get student profile image URL
	@GetMapping("/{id}/profile-image")
	public ResponseEntity<ResponseStructure<StudentProfileImageDTO>> getProfileImage(@PathVariable Long id) {

		StudentProfileImageDTO dto = studentsService.getProfileImage(id);

		if (dto == null) {
			return ResponseEntity.notFound().build();
		}

		ResponseStructure<StudentProfileImageDTO> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Profile image fetched successfully", dto);

		return ResponseEntity.ok(response);
	}

	// Delete student profile image from Cloudinary
	@DeleteMapping("/{id}/profile-image")
	public ResponseEntity<ResponseStructure<String>> deleteProfileImage(@PathVariable Long id) {

		studentsService.deleteProfileImage(id);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Profile image deleted successfully", "Image deleted from Cloudinary");

		return ResponseEntity.ok(response);
	}
}
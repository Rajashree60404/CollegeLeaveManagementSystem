package in.clms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import in.clms.dto.ForgotPasswordDTO;
import in.clms.dto.LoginDTO;
import in.clms.dto.RegisterStaffDTO;
import in.clms.dto.ResetPasswordDTO;
import in.clms.dto.StaffProfileImageDTO;
import in.clms.dto.StaffRegisterStudentDTO;
import in.clms.dto.StaffsDTO;
import in.clms.dto.StudentDTO;
import in.clms.dto.VerifyOtpDTO;
import in.clms.model.Staff;
import in.clms.repository.StaffsRepository;
import in.clms.service.StaffsService;
import in.clms.service.StudentsService;
import in.clms.util.ResponseStructure;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/staffs")
@Tag(name = "CLMS Project", description = "Manage student leave request")
@AllArgsConstructor
public class StaffsController {

	private final StaffsService staffService;
	private final StudentsService studentsService;

	// Staff Registration
	@PostMapping("/register")
	public ResponseEntity<ResponseStructure<StaffsDTO>> addStaff(@RequestBody RegisterStaffDTO staffDTO) {

		StaffsDTO savedStaff = staffService.addStaff(staffDTO);

		ResponseStructure<StaffsDTO> response = new ResponseStructure<>(HttpStatus.CREATED.value(),
				"Staff registered successfully", savedStaff);

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	// Staff Login
	@PostMapping("/login")
	public ResponseEntity<ResponseStructure<StaffsDTO>> login(@RequestBody LoginDTO loginDTO) {

		StaffsDTO staff = staffService.login(loginDTO);

		ResponseStructure<StaffsDTO> response = new ResponseStructure<>(HttpStatus.OK.value(), "Staff login successful",
				staff);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/register-student")
	public ResponseEntity<ResponseStructure<StudentDTO>> registerStudent(@RequestBody StaffRegisterStudentDTO dto) {

		StudentDTO student = studentsService.registerStudentByStaff(dto);

		ResponseStructure<StudentDTO> response = new ResponseStructure<>();
		response.setMessage("Student registered successfully");
		response.setData(student);
		response.setStatusCode(HttpStatus.CREATED.value());

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	// Get Staff By ID
	@GetMapping("/{id}")
	public ResponseEntity<ResponseStructure<StaffsDTO>> getStaffById(@PathVariable Long id) {

		StaffsDTO staff = staffService.getStaffById(id);

		ResponseStructure<StaffsDTO> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Staff details fetched successfully", staff);

		return ResponseEntity.ok(response);
	}

	// Get All Staff
	@GetMapping
	public ResponseEntity<ResponseStructure<List<StaffsDTO>>> getAllStaffs() {

		List<StaffsDTO> staffs = staffService.getAllStaffs();

		ResponseStructure<List<StaffsDTO>> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Staffs fetched successfully", staffs);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<ResponseStructure<String>> forgotPassword(@RequestBody ForgotPasswordDTO dto) {

		staffService.forgotPassword(dto);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"OTP sent successfully to your email", null);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<ResponseStructure<String>> verifyOtp(@RequestBody VerifyOtpDTO dto) {

		staffService.verifyOtp(dto);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(), "OTP verified successfully",
				null);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ResponseStructure<String>> resetPassword(@RequestBody ResetPasswordDTO dto) {

		staffService.resetPassword(dto);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Password reset successfully", null

		);

		return ResponseEntity.ok(response);
	}

	@PutMapping("/{id}")
	public ResponseEntity<ResponseStructure<Staff>> updateStaffs(@PathVariable Long id,
			@RequestBody Staff updatedStaff) {

		Staff savedStaff = staffService.updateStaff(id, updatedStaff);

		ResponseStructure<Staff> response = new ResponseStructure<>();
		response.setStatusCode(HttpStatus.OK.value());
		response.setMessage("Staff profile updated successfully");
		response.setData(savedStaff);

		return ResponseEntity.ok(response);
	}

	// Upload or replace staff profile image
	@PostMapping(value = "/{id}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ResponseStructure<StaffProfileImageDTO>> uploadProfileImage(@PathVariable Long id,
			@RequestParam("image") MultipartFile image) {

		StaffProfileImageDTO result = staffService.uploadStaffProfileImage(id, image);

		ResponseStructure<StaffProfileImageDTO> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Staff profile image uploaded successfully", result);

		return ResponseEntity.ok(response);
	}

	// Get staff profile image
	@GetMapping("/{id}/profile-image")
	public ResponseEntity<ResponseStructure<StaffProfileImageDTO>> getProfileImage(@PathVariable Long id) {

		StaffProfileImageDTO result = staffService.getStaffProfileImage(id);

		ResponseStructure<StaffProfileImageDTO> response = new ResponseStructure<>(HttpStatus.OK.value(),
				result == null ? "No profile image found" : "Staff profile image fetched successfully", result);

		return ResponseEntity.ok(response);
	}

	// Delete staff profile image
	@DeleteMapping("/{id}/profile-image")
	public ResponseEntity<ResponseStructure<String>> deleteProfileImage(@PathVariable Long id) {

		staffService.deleteStaffProfileImage(id);

		ResponseStructure<String> response = new ResponseStructure<>(HttpStatus.OK.value(),
				"Staff profile image deleted successfully", null);

		return ResponseEntity.ok(response);
	}
}
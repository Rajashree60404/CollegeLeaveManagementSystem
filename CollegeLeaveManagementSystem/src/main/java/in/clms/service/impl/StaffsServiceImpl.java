package in.clms.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.clms.dto.ForgotPasswordDTO;
import in.clms.dto.LoginDTO;
import in.clms.dto.RegisterStaffDTO;
import in.clms.dto.ResetPasswordDTO;
import in.clms.dto.StaffProfileImageDTO;
import in.clms.dto.StaffsDTO;
import in.clms.dto.VerifyOtpDTO;
import in.clms.exception.StaffNotFoundException;
import in.clms.model.Staff;
import in.clms.repository.StaffsRepository;
import in.clms.service.EmailService;
import in.clms.service.ICloudinaryService;
import in.clms.service.StaffsService;
import in.clms.util.JwtUtil;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Service
@AllArgsConstructor
public class StaffsServiceImpl implements StaffsService {

	private final ICloudinaryService cloudinaryService;
	private final StaffsRepository staffsRepository;

	private final EmailService emailService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtUtil jwtutil;

	private String generateOtp() {

		Random random = new Random();

		int otp = 100000 + random.nextInt(900000);

		return String.valueOf(otp);
	}

	private void validateOtp(String storedOtp, LocalDateTime expiryTime, String enteredOtp) {

		if (storedOtp == null || expiryTime == null) {

			throw new IllegalArgumentException("Please generate OTP first");
		}

		if (LocalDateTime.now().isAfter(expiryTime)) {

			throw new IllegalArgumentException("OTP has expired");
		}

		if (!storedOtp.equals(enteredOtp)) {

			throw new IllegalArgumentException("Invalid OTP");
		}
	}

	// Staff Registration
	@Override
	public StaffsDTO addStaff(RegisterStaffDTO dto) {

		if (dto.getName() == null || dto.getName().trim().isEmpty()) {

			throw new IllegalArgumentException("Staff name is required");
		}

		if (dto.getDepartment() == null || dto.getDepartment().trim().isEmpty()) {

			throw new IllegalArgumentException("Department is required");
		}

		if (dto.getEmail() == null || !dto.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

			throw new IllegalArgumentException("Please enter a valid email address");
		}

		if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {

			throw new IllegalArgumentException("Password is required");
		}

		if (dto.getPhoneNumber() == null || !String.valueOf(dto.getPhoneNumber()).matches("^[0-9]{10}$")) {

			throw new IllegalArgumentException("Phone number must contain exactly 10 digits");
		}

		if (staffsRepository.existsByEmail(dto.getEmail())) {

			throw new IllegalArgumentException("Email already registered");
		}

		if (staffsRepository.existsByPhoneNumber(dto.getPhoneNumber())) {

			throw new IllegalArgumentException("Phone number already registered");
		}

		Staff staff = new Staff();

		staff.setName(dto.getName());
		staff.setDepartment(dto.getDepartment());
		staff.setEmail(dto.getEmail());
		staff.setPassword(passwordEncoder.encode(dto.getPassword()));
		staff.setPhoneNumber(dto.getPhoneNumber());

		Staff savedStaff = staffsRepository.save(staff);

		return convertToDTO(savedStaff);
	}

	// Staff Login

	@Override
	public StaffsDTO login(LoginDTO dto) {

		if (dto == null) {
			throw new IllegalArgumentException("Login details are required");
		}

		if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
			throw new IllegalArgumentException("Email is required");
		}

		if (dto.getPassword() == null || dto.getPassword().isBlank()) {
			throw new IllegalArgumentException("Password is required");
		}

		Staff staff = staffsRepository.findByEmail(dto.getEmail().trim())
				.orElseThrow(() -> new StaffNotFoundException("Invalid email or password"));

		String storedPassword = staff.getPassword();

		if (storedPassword == null || storedPassword.isBlank()) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		boolean passwordMatches;

		// Check whether the stored password is already BCrypt encoded
		if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")
				|| storedPassword.startsWith("$2y$")) {

			passwordMatches = passwordEncoder.matches(dto.getPassword(), storedPassword);

		} else {

			// Temporary support for existing plain-text passwords
			passwordMatches = storedPassword.equals(dto.getPassword());

			// Convert the old password to BCrypt after successful login
			if (passwordMatches) {
				staff.setPassword(passwordEncoder.encode(dto.getPassword()));

				staffsRepository.save(staff);
			}
		}

		if (!passwordMatches) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		// Generate jwt after successful authentication
		String token = jwtutil.generateToken(staff.getEmail(), "STAFF");

		StaffsDTO staffsDTO = convertToDTO(staff);
		staffsDTO.setToken(token);
		return staffsDTO;
	}

	// Get Staff By id
	@Override
	public StaffsDTO getStaffById(Long id) {

		Staff staff = staffsRepository.findById(id)
				.orElseThrow(() -> new StaffNotFoundException("Staff not found with ID: " + id));

		return convertToDTO(staff);
	}

	// Get All Staff
	@Override
	public List<StaffsDTO> getAllStaffs() {

		return staffsRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
	}

	// Entity to dto
	private StaffsDTO convertToDTO(Staff staff) {

		return new StaffsDTO(staff.getId(), staff.getName(), staff.getDepartment(), staff.getEmail(),
				staff.getPhoneNumber(), null);
	}

	@Override
	public void forgotPassword(ForgotPasswordDTO dto) {

		if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
			throw new IllegalArgumentException("Email is required");
		}

		String email = dto.getEmail().trim();

		Staff staff = staffsRepository.findByEmail(email)
				.orElseThrow(() -> new StaffNotFoundException("Staff not found with this email"));

		String otp = generateOtp();

		staff.setOtp(otp);
		staff.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

		staffsRepository.save(staff);

		emailService.sendOtp(staff.getEmail(), otp);
	}

	@Override
	public void verifyOtp(VerifyOtpDTO dto) {

		Staff staff = staffsRepository.findByEmail(dto.getEmail())
				.orElseThrow(() -> new StaffNotFoundException("Staff not found with this email"));

		validateOtp(staff.getOtp(), staff.getOtpExpiry(), dto.getOtp());
	}

	@Override
	public void resetPassword(ResetPasswordDTO dto) {

		if (dto.getNewPassword() == null || dto.getNewPassword().trim().isEmpty()) {

			throw new IllegalArgumentException("New password is required");
		}

		if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {

			throw new IllegalArgumentException("Passwords do not match");
		}

		Staff staff = staffsRepository.findByEmail(dto.getEmail())
				.orElseThrow(() -> new StaffNotFoundException("Staff not found with this email"));

		validateOtp(staff.getOtp(), staff.getOtpExpiry(), dto.getOtp());

		staff.setPassword(passwordEncoder.encode(dto.getNewPassword()));

		// Clear OTP in table
		staff.setOtp(null);
		staff.setOtpExpiry(null);

		staffsRepository.save(staff);
	}

	@Override
	public Staff updateStaff(Long id, Staff updatedStaff) {

		Staff existingStaff = staffsRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Staff not found with ID: " + id));

		existingStaff.setName(updatedStaff.getName());
		existingStaff.setDepartment(updatedStaff.getDepartment());
		existingStaff.setEmail(updatedStaff.getEmail());
		existingStaff.setPhoneNumber(updatedStaff.getPhoneNumber());

		return staffsRepository.save(existingStaff);
	}

	@Override
	public StaffProfileImageDTO uploadStaffProfileImage(Long id, MultipartFile image) {

		if (image == null || image.isEmpty()) {
			throw new IllegalArgumentException("Please select an image");
		}

		if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
			throw new IllegalArgumentException("Only image files are allowed");
		}

		if (image.getSize() > 5 * 1024 * 1024) {
			throw new IllegalArgumentException("Image size must not exceed 5 MB");
		}

		Staff staff = staffsRepository.findById(id)
				.orElseThrow(() -> new StaffNotFoundException("Staff not found with ID: " + id));

		try {
			Map<?, ?> result = cloudinaryService.uploadFile(image, "staff");

			Object urlObject = result.get("secure_url");
			Object publicIdObject = result.get("public_id");

			if (urlObject == null || publicIdObject == null) {
				throw new IllegalStateException("Cloudinary image upload failed");
			}

			String imageUrl = urlObject.toString();
			String publicId = publicIdObject.toString();

			String oldPublicId = staff.getProfileImagePublicId();

			staff.setProfileImageUrl(imageUrl);
			staff.setProfileImagePublicId(publicId);

			staffsRepository.save(staff);

			// Delete the previous image after successfully saving the new one
			if (oldPublicId != null && !oldPublicId.isBlank()) {
				try {
					cloudinaryService.deleteFile(oldPublicId, "image");
				} catch (Exception e) {
					// Log the error; do not fail the successful upload
					System.err.println("Old staff profile image deletion failed: " + e.getMessage());
				}
			}

			return new StaffProfileImageDTO(imageUrl, publicId);

		} catch (IOException e) {
			throw new RuntimeException("Unable to upload staff profile image", e);
		}
	}

	@Override
	public StaffProfileImageDTO getStaffProfileImage(Long id) {

		Staff staff = staffsRepository.findById(id)
				.orElseThrow(() -> new StaffNotFoundException("Staff not found with ID: " + id));

		if (staff.getProfileImageUrl() == null || staff.getProfileImageUrl().isBlank()) {
			return null;
		}

		return new StaffProfileImageDTO(staff.getProfileImageUrl(), staff.getProfileImagePublicId());
	}

	@Override
	public void deleteStaffProfileImage(Long id) {

		Staff staff = staffsRepository.findById(id)
				.orElseThrow(() -> new StaffNotFoundException("Staff not found with ID: " + id));

		String publicId = staff.getProfileImagePublicId();

		if (publicId == null || publicId.isBlank()) {
			throw new IllegalArgumentException("Staff profile image not found");
		}

		try {
			cloudinaryService.deleteFile(publicId, "image");

			staff.setProfileImageUrl(null);
			staff.setProfileImagePublicId(null);

			staffsRepository.save(staff);

		} catch (Exception e) {
			throw new RuntimeException("Unable to delete staff profile image", e);
		}
	}

}
package in.clms.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

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

public interface StudentsService {

	StudentDTO addStudent(RegisterStudentDTO studentDTO);

	StudentDTO registerStudentByStaff(StaffRegisterStudentDTO dto);

	StudentDTO login(LoginDTO loginDTO);

	StudentDTO getStudentById(Long id);

	List<StudentDTO> getAllStudents();

	
	void verifyOtp(VerifyOtpDTO dto);

	void resetPassword(ResetPasswordDTO dto);

	void sendPasswordSetupOtp(String email);

	StudentDashboardDTO getStudentDashboard(Long studentId);

	void setInitialPassword(SetPasswordDTO dto);

	StudentDTO updateStudentProfile(Long id, StudentProfileDTO dto);

	void uploadProfileImage(Long id, MultipartFile image);

	StudentProfileImageDTO getProfileImage(Long id);

	void deleteProfileImage(Long id);

	void forgotPassword(ForgotPasswordDTO dto);

	
}
package in.clms.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import in.clms.dto.ForgotPasswordDTO;
import in.clms.dto.LoginDTO;
import in.clms.dto.RegisterStaffDTO;
import in.clms.dto.ResetPasswordDTO;
import in.clms.dto.StaffProfileImageDTO;
import in.clms.dto.StaffsDTO;
import in.clms.dto.VerifyOtpDTO;
import in.clms.model.LeaveRequest;
import in.clms.model.Staff;

public interface StaffsService {

	 StaffsDTO addStaff(RegisterStaffDTO staffDTO);

	    StaffsDTO login(LoginDTO loginDTO);

	    StaffsDTO getStaffById(Long id);

	    List<StaffsDTO> getAllStaffs();
	   
	    void forgotPassword(ForgotPasswordDTO dto);

	    void verifyOtp(VerifyOtpDTO dto);

	    void resetPassword(ResetPasswordDTO dto);
	    
	    Staff updateStaff(Long id, Staff updatedStaff);

		StaffProfileImageDTO uploadStaffProfileImage(Long id, MultipartFile image);

		StaffProfileImageDTO getStaffProfileImage(Long id);

		void deleteStaffProfileImage(Long id);

}

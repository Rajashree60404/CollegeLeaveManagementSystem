package in.clms.service;

public interface EmailService {
	void sendLeaveApplicationEmail(String toEmail, String studentName, Long leaveId, String fromDate, String toDate,
			String reason, String token);

	void sendStaffLeaveApprovalEmail(String toEmail, String staffName, String studentName, Long leaveId,
			String fromDate, String toDate, String reason);

	void sendStaffFinalApprovalEmail(String toEmail, String studentName, Long leaveId, String fromDate, String toDate,
			String reason);

	void sendStaffRejectionEmail(String toEmail, String studentName, Long leaveId, String fromDate, String toDate,
			String reason);

	void sendOtp(String toEmail, String otp);

	// New student welcome email with the CLMS login link
	void sendStudentWelcomeEmail(String toEmail, String studentName);

	void sendExtendedLeaveNotification(String studentEmail, String parentEmail, String studentName, Long leaveId,
			String fromDate, String toDate, String staffName);

}

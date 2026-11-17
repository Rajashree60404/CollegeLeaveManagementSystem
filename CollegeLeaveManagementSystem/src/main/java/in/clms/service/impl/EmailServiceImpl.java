
package in.clms.service.impl;

import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import in.clms.enums.LeaveStatus;
import in.clms.enums.ParentApprovalEum;
import in.clms.service.EmailService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

	private final JavaMailSender mailSender;

	private static final String STUDENT_LOGIN_URL = "http://localhost:5173/login";

	// send otp for password setup or password reset.
	@Override
	public void sendOtp(String toEmail, String otp) {

		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(toEmail);
		message.setSubject("CLMS - Password Verification OTP");

		message.setText("Dear Student,\n\n" + "Your OTP for College Leave Management System is: " + otp + "\n\n"
				+ "This OTP is valid for 5 minutes.\n\n" + "Regards,\n" + "College Leave Management System");

		mailSender.send(message);
	}

	// welcome email after staff registers a student.
	@Override
	public void sendStudentWelcomeEmail(String toEmail, String studentName) {

		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(toEmail);
		message.setSubject("Welcome to CLMS - Activate Your Student Account");

		message.setText("Dear " + studentName + ",\n\n" + "Your account has been registered in the "
				+ "College Leave Management System (CLMS).\n\n"
				+ "To access your account, please open the link below:\n\n" + STUDENT_LOGIN_URL + "\n\n"
				+ "FIRST-TIME LOGIN INSTRUCTIONS:\n" + "1. Open the CLMS login page.\n"
				+ "2. Select the option to set your password for the first time.\n"
				+ "3. Enter your registered email address.\n" + "4. Request an OTP and check your email.\n"
				+ "5. Enter the OTP, create your password, " + "and confirm it.\n"
				+ "6. Log in using your registered email and new password.\n\n"
				+ "If your OTP expires, you can request a new one " + "from the password setup page.\n\n" + "Regards,\n"
				+ "College Leave Management System");

		mailSender.send(message);
	}

	// Email to parent for leave application
	@Override
	public void sendLeaveApplicationEmail(String toEmail, String studentName, Long leaveId, String fromDate,
			String toDate, String reason, String token) {

		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(toEmail);

		message.setSubject("Leave Application - Parent Approval Required");

		// approval confirmation links
		String approveLink = "http://localhost:5173/parent-approval?token=" + token + "&action="
				+ ParentApprovalEum.APPROVE.name();

		String rejectLink = "http://localhost:5173/parent-approval?token=" + token + "&action="
				+ ParentApprovalEum.REJECT.name();

		message.setText("Dear Parent,\n\n"

				+ "Your ward " + studentName + " has applied for leave.\n\n"

				+ "Leave ID: " + leaveId + "\n" + "From Date: " + fromDate + "\n" + "To Date: " + toDate + "\n"
				+ "Reason: " + reason + "\n\n"

				+ "Please review the leave application.\n\n"

				+ "APPROVE LEAVE:\n" + approveLink + "\n\n"

				+ "REJECT LEAVE:\n" + rejectLink + "\n\n"

				+ "This approval link expires in 24 hours.\n\n"

				+ "Regards,\n" + "College Leave Management System");

		mailSender.send(message);
	}

	// Email to staff for leave approval.
	@Override
	public void sendStaffLeaveApprovalEmail(String toEmail, String staffName, String studentName, Long leaveId,
			String fromDate, String toDate, String reason) {

		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(toEmail);
		message.setSubject("Leave Application - Staff Approval Required");

		message.setText("Dear " + staffName + ",\n\n" + "A leave application has been approved by "
				+ "the parent and is now waiting for your approval.\n\n" + "Student Name: " + studentName + "\n"
				+ "Leave ID: " + leaveId + "\n" + "From Date: " + fromDate + "\n" + "To Date: " + toDate + "\n"
				+ "Reason: " + reason + "\n\n" + "Please review the leave application "
				+ "and approve or reject it.\n\n" + "Regards,\n" + "College Leave Management System");

		mailSender.send(message);
	}

	// Email to parent when staff rejects a leave.
	@Override
	public void sendStaffRejectionEmail(String toEmail, String studentName, Long leaveId, String fromDate,
			String toDate, String reason) {

		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(toEmail);
		message.setSubject("Leave Application Rejected");

		message.setText("Dear Parent,\n\n" + "Your ward's leave application has been " + "rejected by the staff.\n\n"
				+ "Student Name: " + studentName + "\n" + "Leave ID: " + leaveId + "\n" + "From Date: " + fromDate
				+ "\n" + "To Date: " + toDate + "\n" + "Reason: " + reason + "\n\n" + "Final Status: REJECTED\n\n"
				+ "Regards,\n" + "College Leave Management System");

		mailSender.send(message);
	}

	// Email to student when the leave is finally approved.
	@Override
	public void sendStaffFinalApprovalEmail(String toEmail, String studentName, Long leaveId, String fromDate,
			String toDate, String reason) {

		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(toEmail);
		message.setSubject("Your Leave Application Is Approved");

		message.setText("Dear " + studentName + ",\n\n" + "Your leave application has been finally approved.\n\n"
				+ "Leave ID: " + leaveId + "\n" + "From Date: " + fromDate + "\n" + "To Date: " + toDate + "\n"
				+ "Reason: " + reason + "\n\n" + "Final Status: APPROVED\n\n" + "Regards,\n"
				+ "College Leave Management System");

		mailSender.send(message);
	}

	@Override
	public void sendExtendedLeaveNotification(String studentEmail, String parentEmail, String studentName, Long leaveId,
			String fromDate, String toDate, String staffName) {
		SimpleMailMessage message = new SimpleMailMessage();

		message.setTo(studentEmail);

		if (parentEmail != null && !parentEmail.isBlank()) {
			message.setCc(parentEmail);
		}

		message.setSubject("Important: Extended Leave Request - CLMS");

		message.setText("Dear " + studentName + ",\n\n"
				+ "Your extended leave request has been submitted successfully.\n\n" + "Leave Request ID: " + leaveId
				+ "\n" + "From Date: " + fromDate + "\n" + "To Date: " + toDate + "\n\n" + "IMPORTANT:\n"
				+ "Since your leave duration exceeds 7 days, "
				+ "you and your parent are requested to contact your assigned " + "class in-charge staff member, "
				+ staffName + ", " + "and inform them about your extended leave.\n\n"
				+ "Please discuss your leave requirement with the staff member "
				+ "and provide any additional supporting documents if required.\n\n"
				+ "Please note that your leave request is still pending parent " + "and staff approval.\n\n"
				+ "Regards,\n" + "College Leave Management System (CLMS)");

		mailSender.send(message);

	}
}

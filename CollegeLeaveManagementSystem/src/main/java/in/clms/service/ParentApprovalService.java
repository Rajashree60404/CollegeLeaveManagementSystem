package in.clms.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.clms.model.LeaveRequest;
import in.clms.model.ParentApproval;
import in.clms.repository.LeaveRequestRepository;
import in.clms.repository.ParentApprovalRepo;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@Service
public class ParentApprovalService {

	private final ParentApprovalRepo tokenRepository;
	private final LeaveRequestRepository leaveRequestRepository;
	private final SecureRandom secureRandom;

	public ParentApprovalService(ParentApprovalRepo tokenRepository, LeaveRequestRepository leaveRequestRepository) {

		this.tokenRepository = tokenRepository;
		this.leaveRequestRepository = leaveRequestRepository;
		this.secureRandom = new SecureRandom();
	}

	@Transactional
	public String generateToken(Long leaveId) {

		LeaveRequest leave = leaveRequestRepository.findById(leaveId)
				.orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

		// Generate secure random token
		byte[] randomBytes = new byte[32];
		secureRandom.nextBytes(randomBytes);

		String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

		// Create token record
		ParentApproval approvalToken = new ParentApproval();

		approvalToken.setToken(token);
		approvalToken.setLeaveRequest(leave);
		approvalToken.setExpiryTime(LocalDateTime.now().plusHours(24));
		approvalToken.setUsed(false);

		tokenRepository.save(approvalToken);

		return token;
	}

	public ParentApproval validateToken(String token) {

		ParentApproval approvalToken = tokenRepository.findByToken(token)
				.orElseThrow(() -> new IllegalArgumentException("Invalid approval token"));

		if (approvalToken.isUsed()) {
			throw new IllegalArgumentException("This approval link has already been used");
		}

		if (LocalDateTime.now().isAfter(approvalToken.getExpiryTime())) {
			throw new IllegalArgumentException("Approval link has expired");
		}

		return approvalToken;
	}

	public void markTokenAsUsed(ParentApproval approvalToken) {

		approvalToken.setUsed(true);

		tokenRepository.save(approvalToken);
	}
}

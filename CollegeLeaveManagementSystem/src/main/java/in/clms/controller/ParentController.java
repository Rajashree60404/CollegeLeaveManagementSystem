package in.clms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import in.clms.dto.LeaveRequestDTO;
import in.clms.dto.ParentApprovalRequest;
import in.clms.enums.LeaveStatus;
import in.clms.enums.ParentApprovalEum;
import in.clms.model.ParentApproval;
import in.clms.service.LeaveRequestService;
import in.clms.service.ParentApprovalService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/parent")
@AllArgsConstructor
public class ParentController {

	private final LeaveRequestService leaveRequestService;
	private final ParentApprovalService parentApprovalService;

	// Parent Approve Leave
	@GetMapping("/approval")
	public ResponseEntity<String> approvalLink(@RequestParam String token, @RequestParam ParentApprovalEum action) {

		if (action != ParentApprovalEum.APPROVE && action != ParentApprovalEum.REJECT) {
			return ResponseEntity.badRequest().body("Invalid approval action");
		}

		return ResponseEntity.ok("Token received. Please confirm your decision.");
	}

	@PostMapping("/approval/confirm")
	@Transactional
	public ResponseEntity<LeaveRequestDTO> confirmApproval(@RequestBody ParentApprovalRequest request) {

		// Validate token
		ParentApproval approvalToken = parentApprovalService.validateToken(request.getToken());

		// Get leave request ID
		Long leaveId = approvalToken.getLeaveRequest().getId();

		LeaveRequestDTO leave;

		// Process parent's decision
		if (request.getAction() == ParentApprovalEum.APPROVE) {

			leave = leaveRequestService.parentApprove(leaveId);

		} else if (request.getAction() == ParentApprovalEum.REJECT) {

			leave = leaveRequestService.parentReject(leaveId);

		} else {
			throw new IllegalArgumentException("Invalid parent action");
		}

		// Mark token as used after successful decision
		parentApprovalService.markTokenAsUsed(approvalToken);

		return ResponseEntity.ok(leave);
	}
}
package in.clms.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "parent_approval_tokens")
public class ParentApproval {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 100)
	private String token;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "leave_request_id", nullable = false, unique = true)
	private LeaveRequest leaveRequest;

	@Column(nullable = false)
	private LocalDateTime expiryTime;

	@Column(nullable = false)
	private boolean used = false;
}

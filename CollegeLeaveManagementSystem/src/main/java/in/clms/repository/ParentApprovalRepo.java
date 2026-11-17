package in.clms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import in.clms.model.ParentApproval;

public interface ParentApprovalRepo extends JpaRepository<ParentApproval, Long>{

	 Optional<ParentApproval> findByToken(String token);
	 
	 Optional<ParentApproval> findByLeaveRequestId(Long leaveId);
	
}

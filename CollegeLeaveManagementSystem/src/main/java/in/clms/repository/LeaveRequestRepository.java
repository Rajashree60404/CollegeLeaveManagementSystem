package in.clms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import in.clms.model.LeaveRequest;

public interface LeaveRequestRepository
        extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByStudentId(Long studentId);
}
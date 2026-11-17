package in.clms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import in.clms.model.Staff;

public interface StaffsRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(Long phoneNumber);
    
    Optional<Staff> findFirstByDepartment(String department);
}
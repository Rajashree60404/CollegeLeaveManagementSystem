package in.clms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import in.clms.model.Student;

public interface StudentsRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(Long phoneNumber);
}
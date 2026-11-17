package in.clms.exceptions.handler;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import in.clms.exception.LeaveRequestNotFoundException;
import in.clms.exception.StaffNotFoundException;
import in.clms.exception.StudentNotFoundException;
import in.clms.util.ErrorStructure;
import lombok.AllArgsConstructor;


@AllArgsConstructor
@RestControllerAdvice
public class GlobalExceptionHandler {

	// Student Not Found
	@ExceptionHandler(StudentNotFoundException.class)
	public ResponseEntity<ErrorStructure> handleStudentNotFound(StudentNotFoundException exception) {

		ErrorStructure error = new ErrorStructure();

		error.setStatusCode(HttpStatus.NOT_FOUND.value());
		error.setMessage(exception.getMessage());
		error.setError("Student Not Found");
		error.setTimestamp(LocalDateTime.now());

		return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
	}

	// Staff Not Found
	@ExceptionHandler(StaffNotFoundException.class)
	public ResponseEntity<ErrorStructure> handleStaffNotFound(StaffNotFoundException exception) {

		ErrorStructure error = new ErrorStructure();

		error.setStatusCode(HttpStatus.NOT_FOUND.value());
		error.setMessage(exception.getMessage());
		error.setError("Staff Not Found");
		error.setTimestamp(LocalDateTime.now());

		return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
	}

	// Leave Request Not Found
	@ExceptionHandler(LeaveRequestNotFoundException.class)
	public ResponseEntity<ErrorStructure> handleLeaveRequestNotFound(LeaveRequestNotFoundException exception) {

		ErrorStructure error = new ErrorStructure();

		error.setStatusCode(HttpStatus.NOT_FOUND.value());
		error.setMessage(exception.getMessage());
		error.setError("Leave Request Not Found");
		error.setTimestamp(LocalDateTime.now());

		return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
	}

	// Illegal Argument / Validation Error
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorStructure> handleIllegalArgument(IllegalArgumentException exception) {

		ErrorStructure error = new ErrorStructure();

		error.setStatusCode(HttpStatus.BAD_REQUEST.value());
		error.setMessage(exception.getMessage());
		error.setError("Bad Request");
		error.setTimestamp(LocalDateTime.now());

		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}

	// General Exception
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorStructure> handleGeneralException(Exception exception) {

		ErrorStructure error = new ErrorStructure();

		error.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());

		error.setMessage("An unexpected error occurred");
		error.setError(exception.getClass().getSimpleName());
		error.setTimestamp(LocalDateTime.now());

		return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
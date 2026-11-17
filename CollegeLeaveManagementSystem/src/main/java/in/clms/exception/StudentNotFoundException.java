package in.clms.exception;

import org.springframework.http.HttpStatus;

public class StudentNotFoundException extends RuntimeException {

	private HttpStatus status;
    public StudentNotFoundException(String message) {
        super(message);
    }
    
    public HttpStatus getStatus() {
        return status;
    }
}
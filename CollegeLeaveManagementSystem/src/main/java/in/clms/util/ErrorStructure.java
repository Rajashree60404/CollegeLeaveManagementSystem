package in.clms.util;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ErrorStructure {

    private int statusCode;
    private String message;
    private String error;
    private LocalDateTime timestamp;

}
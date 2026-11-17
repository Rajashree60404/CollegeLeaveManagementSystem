package in.clms.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterStudentDTO {

	private Long registerNo;
    private String name;
    private String department;
    private String email;
    private String password;
    private Long phoneNumber;
    private String parentEmail;

   
}
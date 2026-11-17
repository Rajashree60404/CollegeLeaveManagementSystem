package in.clms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterStaffDTO {

    private String name;
    private String department;
    private String email;
    private String password;
    private Long phoneNumber;

   
}
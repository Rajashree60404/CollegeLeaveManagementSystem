package in.clms.dto;



import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StaffRegisterStudentDTO {

    private Long registerNo;
    private String name;
    private String department;
    private String email;
    private Long phoneNumber;
    private String parentEmail;
}
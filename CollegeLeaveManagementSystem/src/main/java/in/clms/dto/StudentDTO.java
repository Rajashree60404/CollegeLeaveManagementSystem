package in.clms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {

    private Long id;
    private Long registerNo;
    private String name;
    private String department;
    private String email;
    private Long phoneNumber;
    private String parentEmail;
    private String token;

   }
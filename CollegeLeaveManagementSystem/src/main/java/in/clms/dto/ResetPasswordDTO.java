package in.clms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ResetPasswordDTO {
	private String email;
    private String otp;
    private String newPassword;
    private String confirmPassword;
}

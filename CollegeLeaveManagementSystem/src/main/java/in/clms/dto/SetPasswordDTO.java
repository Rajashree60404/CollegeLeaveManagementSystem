package in.clms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SetPasswordDTO {
	  private String email;
	    private String password;
	    private String confirmPassword;
}

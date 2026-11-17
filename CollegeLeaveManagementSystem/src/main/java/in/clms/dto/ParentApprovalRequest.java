package in.clms.dto;

import in.clms.enums.ParentApprovalEum;
import lombok.Data;
@Data
public class ParentApprovalRequest {
	private String token;
    private ParentApprovalEum action;
}

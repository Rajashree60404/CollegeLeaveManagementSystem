package in.clms.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
public class AppProperties {

	 @Value("${cloudinary.cloud-name}")
	    private String cloudName;

	    @Value("${cloudinary.api-key}")
	    private String apiKey;

	    @Value("${cloudinary.api-secret}")
	    private String apiSecret;
}

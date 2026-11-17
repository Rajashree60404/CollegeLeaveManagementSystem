package in.clms.config;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.cloudinary.Cloudinary;

import in.clms.util.AppProperties;
import in.clms.util.JwtRequestFilter;
import lombok.AllArgsConstructor;

@Configuration
@EnableWebSecurity
public class AppConfig {

	 private final AppProperties appProperties;
	private final JwtRequestFilter jwtRequestFilter;

	
	public AppConfig(AppProperties appProperties, JwtRequestFilter jwtRequestFilter) {
		super();
		this.appProperties = appProperties;
		this.jwtRequestFilter = jwtRequestFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> csrf.disable())

				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				.authorizeHttpRequests(auth -> auth

						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// Public parent approval APIs - GET and POST
						.requestMatchers("/parent/**").permitAll()
						// Swagger access
						.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs", "/v3/api-docs/**")
						.permitAll()

						// Public login APIs
						.requestMatchers(HttpMethod.POST, "/staffs/login", "/students/login", "/staffs/forgot-password",
								"/staffs/verify-otp", "/staffs/reset-password", "/students/set-initial-password")
						.permitAll()

						.anyRequest().authenticated())

				.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {

		CorsConfiguration configuration = new CorsConfiguration();

		configuration
				.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:5175"));

		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

		source.registerCorsConfiguration("/**", configuration);

		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	 @Bean
	    public Cloudinary cloudinary() {

	        Map<String, String> config = new HashMap<>();

	        config.put("cloud_name", appProperties.getCloudName().trim());
	        config.put("api_key", appProperties.getApiKey().trim());
	        config.put("api_secret", appProperties.getApiSecret().trim());
	        config.put("secure", "true");

	        return new Cloudinary(config);
	    }
}

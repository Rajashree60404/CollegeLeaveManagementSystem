package in.clms.util;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import in.clms.model.Staff;
import in.clms.model.Student;
import in.clms.repository.StaffsRepository;
import in.clms.repository.StudentsRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

	@Autowired
	private final JwtUtil jwtService;
	@Autowired
	private final StudentsRepository studentsRepository;
	@Autowired
	private final StaffsRepository staffsRepository;

	public JwtRequestFilter(in.clms.util.JwtUtil jwtService, StudentsRepository studentsRepository,
			StaffsRepository staffsRepository) {
		this.jwtService = jwtService;
		this.studentsRepository = studentsRepository;
		this.staffsRepository = staffsRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		final String authHeader = request.getHeader("Authorization");

		// Check whether Authorization header contains Bearer token
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authHeader.substring(7);

		try {

			String email = jwtService.extractEmail(token);
			String role = jwtService.extractRole(token);

			if (email != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {

				boolean userExists = false;

				if ("STUDENT".equalsIgnoreCase(role)) {

					Optional<Student> student = studentsRepository.findByEmail(email);

					userExists = student.isPresent();

				} else if ("STAFF".equalsIgnoreCase(role)) {

					Optional<Staff> staff = staffsRepository.findByEmail(email);

					userExists = staff.isPresent();
				}

				if (userExists && jwtService.isTokenValid(token, email)) {

					UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email,
							null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));

					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			}

		} catch (Exception exception) {

			SecurityContextHolder.clearContext();
		}

		filterChain.doFilter(request, response);
	}
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {

	    String path = request.getServletPath();

	    return path.startsWith("/swagger-ui/")
	            || path.equals("/swagger-ui.html")
	            || path.equals("/v3/api-docs")
	            || path.startsWith("/v3/api-docs/");
	}

}

package com.blog.userservice.security;

import com.blog.userservice.model.User;
import com.blog.userservice.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Check if request comes from API Gateway with user info headers
        String gatewayUserId = request.getHeader("X-User-Id");
        String gatewayUserRole = request.getHeader("X-User-Role");

        if (gatewayUserId != null && gatewayUserRole != null) {
            // Trust API Gateway authentication
            try {
                Optional<User> userOptional = userRepository.findById(UUID.fromString(gatewayUserId));
                
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    
                    // Set request attributes for controllers to use
                    request.setAttribute("userId", user.getId());
                    request.setAttribute("role", user.getRole().name());

                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            null,
                            Collections.singletonList(authority));

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                logger.error("Gateway authentication error: " + e.getMessage());
            }
        } else {
            // Fallback to Bearer token validation for direct calls
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    String username = jwtUtil.extractUsername(token);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        Optional<User> userOptional = userRepository.findByUsername(username);

                        if (userOptional.isPresent() && jwtUtil.validateToken(token, username)) {
                            User user = userOptional.get();

                            // Set request attributes for controllers to use
                            request.setAttribute("userId", user.getId());
                            request.setAttribute("role", user.getRole().name());

                            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(authority));

                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                } catch (Exception e) {
                    logger.error("JWT validation error: " + e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

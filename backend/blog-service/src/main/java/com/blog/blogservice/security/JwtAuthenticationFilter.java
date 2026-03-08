package com.blog.blogservice.security;

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
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

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
                UUID userId = UUID.fromString(gatewayUserId);

                // Extract username from Bearer token (gateway forwards it unchanged)
                String username = "gateway-user";
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    try {
                        String token = authHeader.substring(7);
                        String extracted = jwtUtil.extractUsername(token);
                        if (extracted != null) username = extracted;
                    } catch (Exception ignored) {}
                }

                // Set request attributes for controllers to use
                request.setAttribute("userId", userId);
                request.setAttribute("username", username);
                request.setAttribute("role", gatewayUserRole);

                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + gatewayUserRole);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singletonList(authority));

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception e) {
                logger.error("Gateway authentication error: " + e.getMessage());
            }
        } else {
            // Fallback to Bearer token validation for direct calls
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    if (jwtUtil.validateToken(token)) {
                        String username = jwtUtil.extractUsername(token);
                        String role = jwtUtil.extractRole(token);
                        UUID userId = jwtUtil.extractUserId(token);

                        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(authority));

                            // Store userId in request attribute for easy access
                            request.setAttribute("userId", userId);
                            request.setAttribute("username", username);
                            request.setAttribute("role", role);

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

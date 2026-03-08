package com.blog.gateway.filter;

import com.blog.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Skip JWT processing for auth endpoints
        String path = request.getURI().getPath();
        System.out.println("[JWT Filter] Processing path: " + path);
        
        if (path.contains("/auth/login") || path.contains("/auth/register") || 
            path.contains("/auth/verify-email")) {
            System.out.println("[JWT Filter] Skipping auth endpoint");
            return chain.filter(exchange);
        }

        // Extract JWT token from Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        System.out.println("[JWT Filter] Authorization header present: " + (authHeader != null));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("[JWT Filter] Token extracted, length: " + token.length());

            try {
                if (jwtUtil.isTokenValid(token)) {
                    // Extract user information from JWT
                    String userId = jwtUtil.extractUserId(token);
                    String username = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractRole(token);

                    System.out.println("[JWT Filter] Token valid - UserId: " + userId + ", Role: " + role + ", Username: " + username);

                    // Add custom headers with user information
                    ServerHttpRequest modifiedRequest = request.mutate()
                            .header("X-User-Id", userId)
                            .header("X-User-Role", role)
                            .build();

                    return chain.filter(exchange.mutate().request(modifiedRequest).build());
                } else {
                    System.err.println("[JWT Filter] Token validation returned false");
                }
            } catch (Exception e) {
                // Token is invalid, continue without adding headers
                System.err.println("[JWT Filter] JWT validation failed: " + e.getMessage());
                e.printStackTrace();
            }
        }

        System.out.println("[JWT Filter] No valid token found, continuing without headers");
        // Continue without adding headers if token is missing or invalid
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Execute before other filters
    }
}

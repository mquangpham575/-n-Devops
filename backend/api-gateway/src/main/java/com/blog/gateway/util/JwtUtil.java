package com.blog.gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        System.out.println("[JwtUtil] Secret length: " + (secret != null ? secret.length() : "NULL"));
        if (secret == null || secret.isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured!");
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", String.class);
    }

    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            System.out.println("[JwtUtil] Token parsed successfully");
            System.out.println("[JwtUtil] Claims: " + claims);
            return true;
        } catch (Exception e) {
            System.err.println("[JwtUtil] Token validation failed: " + e.getClass().getName());
            System.err.println("[JwtUtil] Error message: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}

package com.blog.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String email;       // null when showEmail=false for other users
    private String role;
    private Boolean enabled;
    private Boolean showEmail;
    private LocalDateTime createdAt;
}

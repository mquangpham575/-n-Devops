package com.blog.userservice.service;

import com.blog.userservice.dto.UserResponse;
import com.blog.userservice.model.User;
import com.blog.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Get all users
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    /**
     * Update user role (Admin only)
     * 
     * @param userId  User ID to update
     * @param newRole New role (USER, EDITOR, ADMIN)
     * @return Updated user
     */
    public UserResponse updateUserRole(UUID userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate role
        try {
            User.Role role = User.Role.valueOf(newRole.toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + newRole + ". Must be USER, EDITOR, or ADMIN");
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    /**
     * Change user password
     * 
     * @param userId          User ID
     * @param currentPassword Current password for verification
     * @param newPassword     New password to set
     */
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password is different
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Send email notification
        emailService.sendPasswordChangeNotification(user.getEmail(), user.getUsername());
    }

    /**
     * Get raw User entity (for internal use)
     */
    public User getRawUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Update showEmail preference for the authenticated user
     */
    public UserResponse updateShowEmail(UUID userId, boolean showEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setShowEmail(showEmail);
        User saved = userRepository.save(user);
        return mapToResponseFull(saved);
    }

    // Returns full data including email (for own profile / admin)
    public UserResponse mapToResponseFull(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .showEmail(user.getShowEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserResponse mapToResponse(User user) {
        // For public view – hide email if user opted out
        String email = Boolean.TRUE.equals(user.getShowEmail()) ? user.getEmail() : null;
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(email)
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .showEmail(user.getShowEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

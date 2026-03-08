package com.blog.userservice.controller;

import com.blog.userservice.service.NotificationService;
import com.blog.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/notifications")
@RequiredArgsConstructor
public class NotificationInternalController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @PostMapping("/new-post")
    public ResponseEntity<?> notifyNewPost(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> followerIds = (List<String>) request.get("followerIds");
            UUID authorId = UUID.fromString((String) request.get("authorId"));
            String authorUsername = (String) request.get("authorUsername");
            UUID blogId = UUID.fromString((String) request.get("blogId"));
            String blogTitle = (String) request.get("blogTitle");
            
            List<UUID> followers = followerIds.stream()
                    .map(UUID::fromString)
                    .toList();
            
            notificationService.notifyFollowersAboutNewPost(followers, authorId, authorUsername, blogId, blogTitle);
            return ResponseEntity.ok(Map.of("message", "Notifications sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/comment-on-post")
    public ResponseEntity<?> notifyCommentOnPost(@RequestBody Map<String, Object> request) {
        try {
            UUID userId = UUID.fromString((String) request.get("userId"));
            UUID actorId = UUID.fromString((String) request.get("actorId"));
            String actorUsername = (String) request.get("actorUsername");
            UUID blogId = UUID.fromString((String) request.get("blogId"));
            String blogTitle = (String) request.get("blogTitle");
            
            notificationService.createCommentOnPostNotification(userId, actorId, actorUsername, blogId, blogTitle);
            return ResponseEntity.ok(Map.of("message", "Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/comment-reply")
    public ResponseEntity<?> notifyCommentReply(@RequestBody Map<String, Object> request) {
        try {
            UUID userId = UUID.fromString((String) request.get("userId"));
            UUID actorId = UUID.fromString((String) request.get("actorId"));
            String actorUsername = (String) request.get("actorUsername");
            UUID commentId = UUID.fromString((String) request.get("commentId"));
            UUID blogId = UUID.fromString((String) request.get("blogId"));
            
            notificationService.createCommentReplyNotification(userId, actorId, actorUsername, commentId, blogId);
            return ResponseEntity.ok(Map.of("message", "Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/post-edited")
    public ResponseEntity<?> notifyPostEdited(@RequestBody Map<String, Object> request) {
        try {
            UUID userId = UUID.fromString((String) request.get("userId"));
            String adminUsername = (String) request.get("adminUsername");
            UUID blogId = UUID.fromString((String) request.get("blogId"));
            String blogTitle = (String) request.get("blogTitle");
            
            notificationService.createPostEditedNotification(userId, adminUsername, blogId, blogTitle);
            return ResponseEntity.ok(Map.of("message", "Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/post-deleted")
    public ResponseEntity<?> notifyPostDeleted(@RequestBody Map<String, Object> request) {
        try {
            UUID userId = UUID.fromString((String) request.get("userId"));
            String adminUsername = (String) request.get("adminUsername");
            String blogTitle = (String) request.get("blogTitle");
            
            notificationService.createPostDeletedNotification(userId, adminUsername, blogTitle);
            return ResponseEntity.ok(Map.of("message", "Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/post-pinned")
    public ResponseEntity<?> notifyPostPinned(@RequestBody Map<String, Object> request) {
        try {
            UUID blogId = UUID.fromString((String) request.get("blogId"));
            String blogTitle = (String) request.get("blogTitle");
            String adminUsername = (String) request.get("adminUsername");
            
            // For now, notify all admins when a post is pinned (can be changed to all relevant users)
            List<UUID> adminIds = userRepository.findAllAdminIds();
            for (UUID adminId : adminIds) {
                notificationService.createPostPinnedNotification(adminId, blogId, blogTitle, adminUsername);
            }
            return ResponseEntity.ok(Map.of("message", "Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

package com.blog.userservice.controller;

import com.blog.userservice.dto.ConversationResponse;
import com.blog.userservice.dto.MessageRequest;
import com.blog.userservice.dto.MessageResponse;
import com.blog.userservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/{receiverId}")
    public ResponseEntity<?> sendMessage(
            @PathVariable UUID receiverId,
            @RequestBody MessageRequest request,
            @RequestHeader("X-User-Id") String senderIdStr) {
        try {
            UUID senderId = UUID.fromString(senderIdStr);
            MessageResponse response = messageService.sendMessage(senderId, receiverId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getMessagesBetweenUsers(
            @PathVariable UUID userId,
            @RequestHeader("X-User-Id") String currentUserIdStr) {
        try {
            UUID currentUserId = UUID.fromString(currentUserIdStr);
            List<MessageResponse> messages = messageService.getMessagesBetweenUsers(currentUserId, userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(@RequestHeader("X-User-Id") String userIdStr) {
        try {
            UUID userId = UUID.fromString(userIdStr);
            List<ConversationResponse> conversations = messageService.getConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable UUID messageId,
            @RequestHeader("X-User-Id") String userIdStr) {
        try {
            UUID userId = UUID.fromString(userIdStr);
            messageService.markAsRead(messageId, userId);
            return ResponseEntity.ok(Map.of("message", "Message marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/read-all/{senderId}")
    public ResponseEntity<?> markAllAsReadFromSender(
            @PathVariable UUID senderId,
            @RequestHeader("X-User-Id") String userIdStr) {
        try {
            UUID receiverId = UUID.fromString(userIdStr);
            messageService.markAllAsReadFromSender(receiverId, senderId);
            return ResponseEntity.ok(Map.of("message", "All messages marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("X-User-Id") String userIdStr) {
        try {
            UUID userId = UUID.fromString(userIdStr);
            long count = messageService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

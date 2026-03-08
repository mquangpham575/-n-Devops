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
public class ConversationResponse {
    private UUID userId;
    private String username;
    private String email;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
    private Boolean isMutualFollow;
}

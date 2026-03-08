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
public class MessageResponse {
    private UUID id;
    private UUID senderId;
    private String senderUsername;
    private UUID receiverId;
    private String receiverUsername;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}

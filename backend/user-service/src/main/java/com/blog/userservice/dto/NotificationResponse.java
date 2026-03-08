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
public class NotificationResponse {
    private UUID id;
    private String type;
    private String content;
    private UUID relatedId;
    private UUID actorId;
    private String actorUsername;
    private Boolean isRead;
    private LocalDateTime createdAt;
}

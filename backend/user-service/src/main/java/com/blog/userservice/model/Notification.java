package com.blog.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_is_read", columnList = "is_read")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;  // User who receives notification

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(name = "related_id")
    private UUID relatedId;  // Blog ID, Comment ID, or User ID

    @Column(name = "actor_id")
    private UUID actorId;  // User who triggered the notification

    @Column(name = "actor_username", length = 50)
    private String actorUsername;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        NEW_POST,           // New post from followed user
        COMMENT_ON_POST,    // Comment on your post
        COMMENT_REPLY,      // Reply to your comment
        POST_EDITED,        // Your post was edited (by admin)
        POST_DELETED,       // Your post was deleted (by admin)
        POST_PINNED,        // Post was pinned as featured (by admin)
        NEW_FOLLOWER,       // Someone followed you
        NEW_MESSAGE         // New chat message
    }
}

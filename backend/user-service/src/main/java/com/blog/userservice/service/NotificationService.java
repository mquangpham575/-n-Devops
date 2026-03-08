package com.blog.userservice.service;

import com.blog.userservice.dto.NotificationResponse;
import com.blog.userservice.model.Notification;
import com.blog.userservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Create notification for new post from followed user
    public void createNewPostNotification(UUID userId, UUID actorId, String actorUsername, UUID blogId, String blogTitle) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.NEW_POST)
                .content(actorUsername + " đã đăng bài viết mới: " + blogTitle)
                .relatedId(blogId)
                .actorId(actorId)
                .actorUsername(actorUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Create notification for comment reply
    public void createCommentReplyNotification(UUID userId, UUID actorId, String actorUsername, UUID commentId, UUID blogId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.COMMENT_REPLY)
                .content(actorUsername + " đã trả lời bình luận của bạn")
                .relatedId(blogId)  // Or commentId, depending on your needs
                .actorId(actorId)
                .actorUsername(actorUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Create notification for comment on post
    public void createCommentOnPostNotification(UUID userId, UUID actorId, String actorUsername, UUID blogId, String blogTitle) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.COMMENT_ON_POST)
                .content(actorUsername + " đã bình luận về bài viết: " + blogTitle)
                .relatedId(blogId)
                .actorId(actorId)
                .actorUsername(actorUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Create notification for post edited by admin
    public void createPostEditedNotification(UUID userId, String adminUsername, UUID blogId, String blogTitle) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.POST_EDITED)
                .content(adminUsername + " đã chỉnh sửa bài viết của bạn: " + blogTitle)
                .relatedId(blogId)
                .actorUsername(adminUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Create notification for post deleted by admin
    public void createPostDeletedNotification(UUID userId, String adminUsername, String blogTitle) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.POST_DELETED)
                .content(adminUsername + " đã xóa bài viết của bạn: " + blogTitle)
                .actorUsername(adminUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Create notification for post pinned as featured
    public void createPostPinnedNotification(UUID recipientId, UUID blogId, String blogTitle, String adminUsername) {
        Notification notification = Notification.builder()
                .userId(recipientId)
                .type(Notification.NotificationType.POST_PINNED)
                .content("Bài viết nổi bật: " + blogTitle + " (được ghim bởi " + adminUsername + ")")
                .relatedId(blogId)
                .actorUsername(adminUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Notify followers about new post
    public void notifyFollowersAboutNewPost(List<UUID> followerIds, UUID authorId, String authorUsername, UUID blogId, String blogTitle) {
        for (UUID followerId : followerIds) {
            createNewPostNotification(followerId, authorId, authorUsername, blogId, blogTitle);
        }
    }

    // Create notification for new follower
    public void createFollowNotification(UUID userId, UUID actorId, String actorUsername) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.NEW_FOLLOWER)
                .content(actorUsername + " đã theo dõi bạn")
                .relatedId(actorId)
                .actorId(actorId)
                .actorUsername(actorUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Create notification for new message
    public void createNewMessageNotification(UUID userId, UUID actorId, String actorUsername) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.NEW_MESSAGE)
                .content(actorUsername + " đã gửi tin nhắn cho bạn")
                .relatedId(actorId)
                .actorId(actorId)
                .actorUsername(actorUsername)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getAllNotifications(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public void deleteReadNotifications(UUID userId) {
        notificationRepository.deleteReadNotifications(userId);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .content(notification.getContent())
                .relatedId(notification.getRelatedId())
                .actorId(notification.getActorId())
                .actorUsername(notification.getActorUsername())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

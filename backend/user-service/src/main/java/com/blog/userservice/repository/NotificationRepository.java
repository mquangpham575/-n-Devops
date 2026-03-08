package com.blog.userservice.repository;

import com.blog.userservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    // Get all notifications for a user, ordered by newest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    // Get unread notifications for a user
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);
    
    // Count unread notifications
    long countByUserIdAndIsReadFalse(UUID userId);
    
    // Mark notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsRead(@Param("id") UUID id);
    
    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") UUID userId);
    
    // Delete old read notifications (cleanup)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.isRead = true")
    void deleteReadNotifications(@Param("userId") UUID userId);
}

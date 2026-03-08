package com.blog.userservice.repository;

import com.blog.userservice.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FollowRepository extends JpaRepository<Follow, UUID> {
    
    // Check if user A follows user B
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    
    // Get all users that a user is following
    List<Follow> findByFollowerId(UUID followerId);
    
    // Get all followers of a user
    List<Follow> findByFollowingId(UUID followingId);
    
    // Delete follow relationship
    void deleteByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    
    // Count followers
    long countByFollowingId(UUID followingId);
    
    // Count following
    long countByFollowerId(UUID followerId);
    
    // Check mutual follow (both users follow each other)
    @Query("SELECT CASE WHEN COUNT(f1) > 0 AND COUNT(f2) > 0 THEN true ELSE false END " +
           "FROM Follow f1, Follow f2 " +
           "WHERE f1.followerId = :userId1 AND f1.followingId = :userId2 " +
           "AND f2.followerId = :userId2 AND f2.followingId = :userId1")
    boolean areMutualFollowers(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);
    
    // Get list of user IDs that current user is following
    @Query("SELECT f.followingId FROM Follow f WHERE f.followerId = :userId")
    List<UUID> findFollowingIdsByFollowerId(@Param("userId") UUID userId);
}

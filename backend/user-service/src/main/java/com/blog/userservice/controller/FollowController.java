package com.blog.userservice.controller;

import com.blog.userservice.dto.FollowResponse;
import com.blog.userservice.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{userId}")
    public ResponseEntity<?> followUser(
            @PathVariable UUID userId,
            @RequestHeader("X-User-Id") String currentUserIdStr) {
        try {
            UUID currentUserId = UUID.fromString(currentUserIdStr);
            followService.followUser(currentUserId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully followed user");
            response.put("isFollowing", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable UUID userId,
            @RequestHeader("X-User-Id") String currentUserIdStr) {
        try {
            UUID currentUserId = UUID.fromString(currentUserIdStr);
            followService.unfollowUser(currentUserId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully unfollowed user");
            response.put("isFollowing", false);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<?> getFollowStatus(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserIdStr) {
        try {
            if (currentUserIdStr == null || currentUserIdStr.isEmpty()) {
                return ResponseEntity.ok(Map.of("isFollowing", false, "isFollower", false, "isMutual", false));
            }
            UUID currentUserId = UUID.fromString(currentUserIdStr);
            boolean isFollowing = followService.isFollowing(currentUserId, userId);
            boolean isFollower  = followService.isFollowing(userId, currentUserId);
            boolean isMutual    = followService.areMutualFollowers(currentUserId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("isFollowing", isFollowing);
            response.put("isFollower", isFollower);
            response.put("isMutual", isMutual);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable UUID userId) {
        try {
            List<FollowResponse> followers = followService.getFollowers(userId);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable UUID userId) {
        try {
            List<FollowResponse> following = followService.getFollowing(userId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<?> getFollowStats(@PathVariable UUID userId) {
        try {
            long followerCount = followService.getFollowerCount(userId);
            long followingCount = followService.getFollowingCount(userId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("followerCount", followerCount);
            stats.put("followingCount", followingCount);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/following-ids")
    public ResponseEntity<?> getFollowingIds(@RequestHeader("X-User-Id") String currentUserIdStr) {
        try {
            UUID currentUserId = UUID.fromString(currentUserIdStr);
            List<UUID> followingIds = followService.getFollowingIds(currentUserId);
            return ResponseEntity.ok(followingIds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/follower-ids/{userId}")
    public ResponseEntity<?> getFollowerIds(@PathVariable UUID userId) {
        try {
            List<UUID> followerIds = followService.getFollowerIds(userId);
            return ResponseEntity.ok(followerIds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}

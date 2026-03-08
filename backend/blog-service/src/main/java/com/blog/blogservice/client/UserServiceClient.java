package com.blog.blogservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "user-service", url = "${services.user-service.url}")
public interface UserServiceClient {

    // Pass X-User-Id directly so user-service trusts it (internal call, Gateway not involved)
    @GetMapping("/api/follow/following-ids")
    List<UUID> getFollowingIds(@RequestHeader("X-User-Id") String userId);

    @GetMapping("/api/follow/follower-ids/{userId}")
    List<UUID> getFollowerIds(@PathVariable("userId") UUID userId);
}

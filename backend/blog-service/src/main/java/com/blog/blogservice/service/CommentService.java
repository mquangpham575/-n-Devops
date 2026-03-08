package com.blog.blogservice.service;

import com.blog.blogservice.client.NotificationServiceClient;
import com.blog.blogservice.dto.CommentRequest;
import com.blog.blogservice.dto.CommentResponse;
import com.blog.blogservice.model.Blog;
import com.blog.blogservice.model.Comment;
import com.blog.blogservice.repository.BlogRepository;
import com.blog.blogservice.repository.CommentRepository;
import com.blog.blogservice.security.Permission;
import com.blog.blogservice.security.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BlogRepository blogRepository;
    private final PermissionService permissionService;
    private final NotificationServiceClient notificationServiceClient;

    public List<CommentResponse> getAllCommentsByBlogId(UUID blogId) {
        // Get only parent comments (no parentId)
        List<Comment> parentComments = commentRepository.findByBlogIdAndParentIdIsNullOrderByCreatedAtDesc(blogId);
        
        return parentComments.stream()
                .map(this::mapToResponseWithReplies)
                .collect(Collectors.toList());
    }

    private CommentResponse mapToResponseWithReplies(Comment comment) {
        CommentResponse response = mapToResponse(comment);
        
        // Get replies for this comment
        List<CommentResponse> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        response.setReplies(replies);
        return response;
    }

    public CommentResponse createComment(UUID blogId, CommentRequest request, UUID authorId, String authorUsername) {
        // Validate parentId exists if provided
        if (request.getParentId() != null) {
            commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .content(request.getContent())
                .blogId(blogId)
                .authorId(authorId)
                .authorUsername(authorUsername)
                .parentId(request.getParentId())
                .build();

        Comment savedComment = commentRepository.save(comment);

        // Send notifications
        try {
            if (request.getParentId() != null) {
                // This is a reply, notify parent comment author
                Comment parent = commentRepository.findById(request.getParentId()).orElse(null);
                if (parent != null && !parent.getAuthorId().equals(authorId)) {
                    notificationServiceClient.notifyCommentReply(Map.of(
                        "userId", parent.getAuthorId().toString(),
                        "actorId", authorId.toString(),
                        "actorUsername", authorUsername,
                        "commentId", savedComment.getId().toString(),
                        "blogId", blogId.toString()
                    ));
                }
            } else {
                // This is a new comment on a post, notify blog author
                Blog blog = blogRepository.findById(blogId).orElse(null);
                if (blog != null && !blog.getAuthorId().equals(authorId)) {
                    notificationServiceClient.notifyCommentOnPost(Map.of(
                        "userId", blog.getAuthorId().toString(),
                        "actorId", authorId.toString(),
                        "actorUsername", authorUsername,
                        "blogId", blogId.toString(),
                        "blogTitle", blog.getTitle()
                    ));
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send comment notifications: " + e.getMessage());
        }

        return mapToResponse(savedComment);
    }

    public CommentResponse updateComment(UUID id, CommentRequest request, UUID userId, String role) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check permission with ownership logic
        if (!permissionService.canAccess(role, Permission.COMMENT_UPDATE_OWN, userId, comment.getAuthorId())) {
            throw new RuntimeException("You do not have permission to update this comment");
        }

        comment.setContent(request.getContent());
        Comment updatedComment = commentRepository.save(comment);
        return mapToResponse(updatedComment);
    }

    public void deleteComment(UUID id, UUID userId, String role) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check permission - only ADMIN can delete comments
        if (!permissionService.hasPermission(role, Permission.COMMENT_DELETE_ALL)) {
            throw new RuntimeException("You do not have permission to delete comments");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .blogId(comment.getBlogId())
                .authorId(comment.getAuthorId())
                .authorUsername(comment.getAuthorUsername())
                .parentId(comment.getParentId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}

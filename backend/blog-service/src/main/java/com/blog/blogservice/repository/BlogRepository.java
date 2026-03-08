package com.blog.blogservice.repository;

import com.blog.blogservice.model.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    List<Blog> findAllByOrderByCreatedAtDesc();

    List<Blog> findAllByStatusTrueOrderByCreatedAtDesc();

    List<Blog> findAllByStatusTrueAndPinnedTrueOrderByCreatedAtDesc();

    List<Blog> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);

    @Query("SELECT b FROM Blog b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.authorUsername) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY b.createdAt DESC")
    List<Blog> searchBlogs(@Param("keyword") String keyword);

    @Query("SELECT b FROM Blog b WHERE b.status = true AND (" +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.authorUsername) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY b.createdAt DESC")
    List<Blog> searchPublicBlogs(@Param("keyword") String keyword);
}

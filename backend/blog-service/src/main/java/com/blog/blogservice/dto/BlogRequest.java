package com.blog.blogservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class BlogRequest {

    @NotNull(message = "Category is required")
    private UUID categoryId;

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String imageUrl;

    private Long imageFileId;

    private String imageMimeType;

    private String originalFileName;

    private String description;

    private Boolean status = true;
}

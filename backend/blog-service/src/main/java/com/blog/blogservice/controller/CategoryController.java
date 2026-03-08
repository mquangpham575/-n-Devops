package com.blog.blogservice.controller;

import com.blog.blogservice.dto.CategoryRequest;
import com.blog.blogservice.dto.CategoryResponse;
import com.blog.blogservice.service.CategoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        List<CategoryResponse> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable UUID id) {
        try {
            CategoryResponse category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategory(
            @Valid @RequestBody CategoryRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            String userIdHeader = httpRequest.getHeader("X-User-Id");
            String roleHeader = httpRequest.getHeader("X-User-Role");

            if (userIdHeader == null || roleHeader == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }

            UUID userId = UUID.fromString(userIdHeader);
            CategoryResponse category = categoryService.createCategory(request, userId, roleHeader);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            String roleHeader = httpRequest.getHeader("X-User-Role");

            if (roleHeader == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }

            CategoryResponse category = categoryService.updateCategory(id, request, roleHeader);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        try {
            String roleHeader = httpRequest.getHeader("X-User-Role");

            if (roleHeader == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }

            categoryService.deleteCategory(id, roleHeader);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

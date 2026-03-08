package com.blog.blogservice.service;

import com.blog.blogservice.dto.CategoryRequest;
import com.blog.blogservice.dto.CategoryResponse;
import com.blog.blogservice.model.Category;
import com.blog.blogservice.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, UUID userId, String role) {
        // Only admin can create categories
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Only admin can create categories");
        }

        // Validate code uniqueness
        if (categoryRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Category code already exists: " + request.getCode());
        }

        // Validate name uniqueness
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exists: " + request.getName());
        }

        Category category = Category.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(userId)
                .active(true)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request, String role) {
        // Only admin can update categories
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Only admin can update categories");
        }

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Validate code uniqueness (excluding current category)
        if (categoryRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new RuntimeException("Category code already exists: " + request.getCode());
        }

        // Validate name uniqueness (excluding current category)
        if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Category name already exists: " + request.getName());
        }

        category.setCode(request.getCode());
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCategory(UUID id, String role) {
        // Only admin can delete categories
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Only admin can delete categories");
        }

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Soft delete - set active to false
        category.setActive(false);
        categoryRepository.save(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .createdBy(category.getCreatedBy())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}

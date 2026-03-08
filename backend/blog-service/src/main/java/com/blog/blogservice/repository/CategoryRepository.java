package com.blog.blogservice.repository;

import com.blog.blogservice.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByActiveTrue();
    List<Category> findAllByOrderByNameAsc();
    
    boolean existsByCode(String code);
    boolean existsByName(String name);
    
    boolean existsByCodeAndIdNot(String code, UUID id);
    boolean existsByNameAndIdNot(String name, UUID id);
}

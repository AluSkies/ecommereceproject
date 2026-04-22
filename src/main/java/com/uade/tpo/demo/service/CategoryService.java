package com.uade.tpo.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.demo.entity.Category;
import com.uade.tpo.demo.entity.dto.CategoryRequest;
import com.uade.tpo.demo.exceptions.CategoryDuplicateException;
import com.uade.tpo.demo.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Category> getCategoryById(int categoryId) {
        return categoryRepository.findById(categoryId);
    }

    public Category createCategory(int id, String description) throws CategoryDuplicateException {
        if (categoryRepository.findById(id).isPresent()) {
            throw new CategoryDuplicateException();
        }
        Category c = Category.builder()
            .id(id)
            .code("CAT-" + id)
            .name(description != null ? description : ("Category " + id))
            .description(description)
            .active(Boolean.TRUE)
            .build();
        return categoryRepository.save(c);
    }

    public Category updateCategory(int id, CategoryRequest request) {
        Category c = categoryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada: " + id));
        if (request.getDescription() != null) {
            c.setDescription(request.getDescription());
            c.setName(request.getDescription());
        }
        return categoryRepository.save(c);
    }

    public void deleteCategory(int id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Categoría no encontrada: " + id);
        }
        categoryRepository.deleteById(id);
    }
}

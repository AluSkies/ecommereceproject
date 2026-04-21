package com.uade.tpo.demo.repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import com.uade.tpo.demo.entity.Category;

public class CategoryRepository {
    private ArrayList<Category> categories;

    public CategoryRepository() {
        categories = new ArrayList<Category>(
            Arrays.asList(new Category(1, "Deportivos"),
                new Category(2, "Inteligentes"),
                new Category(3, "de lujo")));
    }

    public ArrayList<Category> getCategories() {
        return this.categories;
    }

    public Optional<Category> getCategoryById(int categoryId) {
        return this.categories.stream().filter(m -> m.getId() == categoryId).findAny();
    }

    public Category createCategory(int newCategoryId, String description) {
        Category newCategory = new Category(newCategoryId, description);
        this.categories.add(newCategory);
        return newCategory;
    }
}

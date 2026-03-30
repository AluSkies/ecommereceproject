package com.uade.tpo.demo.repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.catalogservice.domain.WatchCategory;
import com.uade.tpo.demo.catalogservice.entity.Product;

@Repository
public class ProductRepository {
    private final List<Product> products;
    private Integer nextId = 1;

    public ProductRepository() {
        this.products = new ArrayList<>();
        initializeSampleData();
    }

    private void initializeSampleData() {
        // Sample luxury watch
        Product watch1 = new Product(
            nextId++, "ROLEX-001", "Rolex Submariner", "rolex-submariner",
            "Iconic dive watch with precision engineering",
            new BigDecimal("9500.00"), new BigDecimal("10000.00"), 15,
            ProductStatus.ACTIVE, WatchCategory.LUXURY, 1L,
            "3235 Perpetual Rotor", "40mm", "Oyster steel/gold"
        );
        watch1.addImage(new Product.Image("https://example.com/rolex1.jpg", 1, "Rolex Submariner front"));
        watch1.addImage(new Product.Image("https://example.com/rolex2.jpg", 2, "Rolex Submariner back"));
        products.add(watch1);

        // Sample sport watch
        Product watch2 = new Product(
            nextId++, "SEIKO-001", "Seiko Prospex", "seiko-prospex",
            "Professional sports watch for adventure",
            new BigDecimal("450.00"), new BigDecimal("550.00"), 50,
            ProductStatus.ACTIVE, WatchCategory.SPORT, 2L,
            "4R36 Automatic", "42mm", "Stainless steel"
        );
        watch2.addImage(new Product.Image("https://example.com/seiko1.jpg", 1, "Seiko Prospex"));
        products.add(watch2);

        // Sample vintage watch
        Product watch3 = new Product(
            nextId++, "OMEGA-001", "Omega Seamaster Vintage", "omega-seamaster-vintage",
            "Classic vintage diving watch from the 1970s",
            new BigDecimal("2800.00"), new BigDecimal("3200.00"), 8,
            ProductStatus.ACTIVE, WatchCategory.VINTAGE, 3L,
            "565 Manual", "42mm", "Steel/leather"
        );
        products.add(watch3);

        // Sample dress watch
        Product watch4 = new Product(
            nextId++, "PATEK-001", "Patek Philippe Calatrava", "patek-calatrava",
            "Elegant dress watch for formal occasions",
            new BigDecimal("35000.00"), new BigDecimal("40000.00"), 3,
            ProductStatus.ACTIVE, WatchCategory.DRESS, 4L,
            "240 Q Manual", "36mm", "Gold/leather"
        );
        products.add(watch4);
    }

    public Product save(Product product) {
        if (product.getId() == null) {
            product.setId(nextId++);
            products.add(product);
        } else {
            products.stream()
                .filter(p -> p.getId().equals(product.getId()))
                .findFirst()
                .ifPresent(p -> {
                    int index = products.indexOf(p);
                    products.set(index, product);
                });
        }
        return product;
    }

    public Optional<Product> findById(Integer id) {
        return products.stream()
            .filter(p -> p.getId().equals(id))
            .findFirst();
    }

    public List<Product> findAll() {
        return new ArrayList<>(products);
    }

    public List<Product> findByCategory(WatchCategory category) {
        return products.stream()
            .filter(p -> p.getCategory() == category)
            .collect(Collectors.toList());
    }

    public List<Product> findByBrandId(Long brandId) {
        return products.stream()
            .filter(p -> p.getBrandId().equals(brandId))
            .collect(Collectors.toList());
    }

    public List<Product> findByStatus(ProductStatus status) {
        return products.stream()
            .filter(p -> p.getStatus() == status)
            .collect(Collectors.toList());
    }

    public List<Product> searchByName(String name) {
        return products.stream()
            .filter(p -> p.getName().toLowerCase().contains(name.toLowerCase()))
            .collect(Collectors.toList());
    }

    public Optional<Product> findBySku(String sku) {
        return products.stream()
            .filter(p -> p.getSku().equalsIgnoreCase(sku))
            .findFirst();
    }

    public void delete(Integer id) {
        products.removeIf(p -> p.getId().equals(id));
    }

    public boolean existsBySku(String sku) {
        return products.stream()
            .anyMatch(p -> p.getSku().equalsIgnoreCase(sku));
    }
}

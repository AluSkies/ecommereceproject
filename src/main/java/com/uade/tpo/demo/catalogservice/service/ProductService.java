package com.uade.tpo.demo.catalogservice.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.catalogservice.domain.WatchCategory;
import com.uade.tpo.demo.catalogservice.dto.ProductRequest;
import com.uade.tpo.demo.catalogservice.dto.ProductResponse;
import com.uade.tpo.demo.catalogservice.entity.Product;
import com.uade.tpo.demo.catalogservice.entity.ProductImage;
import com.uade.tpo.demo.entity.Category;
import com.uade.tpo.demo.repository.CategoryRepository;
import com.uade.tpo.demo.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

/**
 * Business logic for the product catalog, now backed by JPA repositories.
 *
 * <p>The service keeps the previously existing {@code WatchCategory}-based
 * signatures for backwards compatibility: every time a {@link WatchCategory}
 * is received, it is translated to the persisted {@link Category} by looking it
 * up via {@code code = watchCategory.name()}.</p>
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Create a new product
     */
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + request.getSku());
        }

        Product product = Product.builder()
            .sku(request.getSku())
            .name(request.getName())
            .slug(request.getSlug())
            .description(request.getDescription())
            .price(request.getPrice())
            .compareAtPrice(request.getCompareAtPrice())
            .stock(request.getStock() != null ? request.getStock() : 0)
            .status(ProductStatus.ACTIVE)
            .category(resolveCategory(request.getCategory()))
            .brandId(request.getBrandId())
            .caliber(request.getCaliber())
            .caseSize(request.getCaseSize())
            .strapMaterial(request.getStrapMaterial())
            .build();

        if (request.getImages() != null) {
            request.getImages().forEach(img ->
                product.addImage(ProductImage.builder()
                    .url(img.getUrl())
                    .sortOrder(img.getSortOrder())
                    .altText(img.getAltText())
                    .build())
            );
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    /**
     * Get product by ID
     */
    @Transactional(readOnly = true)
    public Optional<ProductResponse> getProductById(Integer id) {
        return productRepository.findById(id).map(this::toResponse);
    }

    /**
     * Get all products
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by category.
     *
     * <p>Backwards-compatible signature: receives {@link WatchCategory}, but under
     * the hood it matches persisted {@link Category} rows by their {@code code}.</p>
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> searchByCategory(WatchCategory category) {
        if (category == null) {
            return List.of();
        }
        return productRepository.findByCategory_Code(category.name()).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by brand
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> searchByBrand(Long brandId) {
        return productRepository.findByBrandId(brandId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by name (case-insensitive contains)
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get active products only
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Update product
     */
    @Transactional
    public ProductResponse updateProduct(Integer id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + request.getSku());
        }

        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCompareAtPrice(request.getCompareAtPrice());
        product.setStock(request.getStock() != null ? request.getStock() : 0);
        product.setCategory(resolveCategory(request.getCategory()));
        product.setBrandId(request.getBrandId());
        product.setCaliber(request.getCaliber());
        product.setCaseSize(request.getCaseSize());
        product.setStrapMaterial(request.getStrapMaterial());

        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    /**
     * Update product price only
     */
    @Transactional
    public ProductResponse updatePrice(Integer id, BigDecimal newPrice) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        product.updatePrice(newPrice);
        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    /**
     * Update product stock
     */
    @Transactional
    public ProductResponse updateStock(Integer id, Integer newStock) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        product.updateStock(newStock);
        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    /**
     * Delete product
     */
    @Transactional
    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }

    /**
     * Get available products (ACTIVE status and stock > 0).
     * Materialized in-memory on top of {@code findByStatus(ACTIVE)} to avoid
     * proliferating near-duplicate {@code @Query} methods for every filter.
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE).stream()
            .filter(Product::isAvailable)
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get available products in a category
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableByCategory(WatchCategory category) {
        if (category == null) {
            return List.of();
        }
        return productRepository.findByCategory_Code(category.name()).stream()
            .filter(Product::isAvailable)
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by price range
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> searchByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get products with low stock (available quantity &lt;= threshold)
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(int threshold) {
        return productRepository.findLowStock(threshold).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get products out of stock
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getOutOfStockProducts() {
        return productRepository.findOutOfStock().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Update product status (activate, deactivate, discontinue, etc.)
     */
    @Transactional
    public ProductResponse updateProductStatus(Integer id, ProductStatus newStatus) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        product.setProductStatus(newStatus);
        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    /**
     * Resolve a {@link WatchCategory} to the persisted {@link Category} row by
     * matching {@code category.code == watchCategory.name()}.
     */
    private Category resolveCategory(WatchCategory watchCategory) {
        if (watchCategory == null) {
            return null;
        }
        return categoryRepository.findByCode(watchCategory.name())
            .orElseThrow(() -> new IllegalArgumentException(
                "Category not found for code: " + watchCategory.name()));
    }

    /**
     * Convert Product entity to ProductResponse DTO
     */
    private ProductResponse toResponse(Product product) {
        List<ProductResponse.ImageResponse> imageResponses = product.getImages() != null
            ? product.getImages().stream()
                .map(img -> new ProductResponse.ImageResponse(img.getUrl(), img.getSortOrder(), img.getAltText()))
                .collect(Collectors.toList())
            : null;

        WatchCategory watchCategory = null;
        String categoryCode = null;
        if (product.getCategory() != null) {
            categoryCode = product.getCategory().getCode();
            watchCategory = toWatchCategory(categoryCode);
        }

        return ProductResponse.builder()
            .id(product.getId())
            .sku(product.getSku())
            .name(product.getName())
            .slug(product.getSlug())
            .description(product.getDescription())
            .price(product.getPrice())
            .compareAtPrice(product.getCompareAtPrice())
            .stock(product.getStock())
            .status(product.getStatus())
            .category(watchCategory)
            .categoryCode(categoryCode)
            .brandId(product.getBrandId())
            .caliber(product.getCaliber())
            .caseSize(product.getCaseSize())
            .strapMaterial(product.getStrapMaterial())
            .images(imageResponses)
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }

    private WatchCategory toWatchCategory(String code) {
        if (code == null) {
            return null;
        }
        try {
            return WatchCategory.valueOf(code);
        } catch (IllegalArgumentException ex) {
            // Persisted code does not match any WatchCategory enum value; tolerate gracefully.
            return null;
        }
    }
}

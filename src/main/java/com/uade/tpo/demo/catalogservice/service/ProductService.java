package com.uade.tpo.demo.catalogservice.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.catalogservice.domain.WatchCategory;
import com.uade.tpo.demo.catalogservice.dto.ProductRequest;
import com.uade.tpo.demo.catalogservice.dto.ProductResponse;
import com.uade.tpo.demo.catalogservice.entity.Product;
import com.uade.tpo.demo.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Create a new product
     */
    public ProductResponse createProduct(ProductRequest request) {
        // Validate SKU uniqueness
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + request.getSku());
        }

        Product product = new Product(
            null,
            request.getSku(),
            request.getName(),
            request.getSlug(),
            request.getDescription(),
            request.getPrice(),
            request.getCompareAtPrice(),
            request.getStock() != null ? request.getStock() : 0,
            ProductStatus.ACTIVE,
            request.getCategory(),
            request.getBrandId(),
            request.getCaliber(),
            request.getCaseSize(),
            request.getStrapMaterial()
        );

        if (request.getImages() != null) {
            request.getImages().forEach(img ->
                product.addImage(new Product.Image(img.getUrl(), img.getSortOrder(), img.getAltText()))
            );
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    /**
     * Get product by ID
     */
    public Optional<ProductResponse> getProductById(Integer id) {
        return productRepository.findById(id).map(this::toResponse);
    }

    /**
     * Get all products
     */
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by category
     */
    public List<ProductResponse> searchByCategory(WatchCategory category) {
        return productRepository.findByCategory(category).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by brand
     */
    public List<ProductResponse> searchByBrand(Long brandId) {
        return productRepository.findByBrandId(brandId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by name
     */
    public List<ProductResponse> searchByName(String name) {
        return productRepository.searchByName(name).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get active products only
     */
    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Update product
     */
    public ProductResponse updateProduct(Integer id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        // Validate SKU uniqueness if changed
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
        product.setCategory(request.getCategory());
        product.setCaliber(request.getCaliber());
        product.setCaseSize(request.getCaseSize());
        product.setStrapMaterial(request.getStrapMaterial());
        product.setUpdatedAt(LocalDateTime.now());

        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    /**
     * Update product price only
     */
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
    public void deleteProduct(Integer id) {
        productRepository.delete(id);
    }

    /**
     * Get available products (active status and stock > 0)
     */
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findAvailableProducts().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get available products in a category
     */
    public List<ProductResponse> getAvailableByCategory(WatchCategory category) {
        return productRepository.findAvailableByCategory(category).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search products by price range
     */
    public List<ProductResponse> searchByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get products with low stock (available quantity <= threshold)
     */
    public List<ProductResponse> getLowStockProducts(int threshold) {
        return productRepository.findLowStockProducts(threshold).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get products out of stock
     */
    public List<ProductResponse> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Update product status (activate, deactivate, discontinue, etc.)
     */
    public ProductResponse updateProductStatus(Integer id, ProductStatus newStatus) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        product.setProductStatus(newStatus);
        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    /**
     * Convert Product entity to ProductResponse DTO
     */
    private ProductResponse toResponse(Product product) {
        List<ProductResponse.ImageResponse> imageResponses = product.getImages() != null ?
            product.getImages().stream()
                .map(img -> new ProductResponse.ImageResponse(img.getUrl(), img.getSortOrder(), img.getAltText()))
                .collect(Collectors.toList())
            : null;

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
            .category(product.getCategory())
            .brandId(product.getBrandId())
            .caliber(product.getCaliber())
            .caseSize(product.getCaseSize())
            .strapMaterial(product.getStrapMaterial())
            .images(imageResponses)
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }
}

package com.uade.tpo.demo.catalogservice.controller;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.catalogservice.domain.WatchCategory;
import com.uade.tpo.demo.catalogservice.dto.ProductRequest;
import com.uade.tpo.demo.catalogservice.dto.ProductResponse;
import com.uade.tpo.demo.catalogservice.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Create a new product
     * POST /api/v1/products
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        ProductResponse created = productService.createProduct(request);
        return ResponseEntity.created(URI.create("/api/v1/products/" + created.getId())).body(created);
    }

    /**
     * Get all products
     * GET /api/v1/products
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get product by ID
     * GET /api/v1/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Integer id) {
        Optional<ProductResponse> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Update product
     * PUT /api/v1/products/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
        @PathVariable Integer id,
        @RequestBody ProductRequest request) {
        try {
            ProductResponse updated = productService.updateProduct(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update product price
     * PATCH /api/v1/products/{id}/price
     */
    @PatchMapping("/{id}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updatePrice(
        @PathVariable Integer id,
        @RequestParam BigDecimal price) {
        try {
            ProductResponse updated = productService.updatePrice(id, price);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update product stock
     * PATCH /api/v1/products/{id}/stock
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateStock(
        @PathVariable Integer id,
        @RequestParam Integer stock) {
        try {
            ProductResponse updated = productService.updateStock(id, stock);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete product
     * DELETE /api/v1/products/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search products by category
     * GET /api/v1/products/search/category?category=LUXURY
     */
    @GetMapping("/search/category")
    public ResponseEntity<List<ProductResponse>> searchByCategory(
        @RequestParam WatchCategory category) {
        List<ProductResponse> products = productService.searchByCategory(category);
        return ResponseEntity.ok(products);
    }

    /**
     * Search products by brand
     * GET /api/v1/products/search/brand?brandId=1
     */
    @GetMapping("/search/brand")
    public ResponseEntity<List<ProductResponse>> searchByBrand(
        @RequestParam Long brandId) {
        List<ProductResponse> products = productService.searchByBrand(brandId);
        return ResponseEntity.ok(products);
    }

    /**
     * Search products by name
     * GET /api/v1/products/search/name?q=rolex
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<ProductResponse>> searchByName(
        @RequestParam String q) {
        List<ProductResponse> products = productService.searchByName(q);
        return ResponseEntity.ok(products);
    }

    /**
     * Get active products
     * GET /api/v1/products/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<ProductResponse>> getActiveProducts() {
        List<ProductResponse> products = productService.getActiveProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get available products (active and in stock)
     * GET /api/v1/products/available
     */
    @GetMapping("/available")
    public ResponseEntity<List<ProductResponse>> getAvailableProducts() {
        List<ProductResponse> products = productService.getAvailableProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get available products by category
     * GET /api/v1/products/available/category?category=LUXURY
     */
    @GetMapping("/available/category")
    public ResponseEntity<List<ProductResponse>> getAvailableByCategory(
        @RequestParam WatchCategory category) {
        List<ProductResponse> products = productService.getAvailableByCategory(category);
        return ResponseEntity.ok(products);
    }

    /**
     * Search products by price range
     * GET /api/v1/products/search/price?minPrice=100&maxPrice=5000
     */
    @GetMapping("/search/price")
    public ResponseEntity<List<ProductResponse>> searchByPriceRange(
        @RequestParam BigDecimal minPrice,
        @RequestParam BigDecimal maxPrice) {
        List<ProductResponse> products = productService.searchByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(products);
    }

    /**
     * Get low stock products
     * GET /api/v1/products/inventory/low-stock?threshold=10
     */
    @GetMapping("/inventory/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts(
        @RequestParam(defaultValue = "10") int threshold) {
        List<ProductResponse> products = productService.getLowStockProducts(threshold);
        return ResponseEntity.ok(products);
    }

    /**
     * Get out of stock products
     * GET /api/v1/products/inventory/out-of-stock
     */
    @GetMapping("/inventory/out-of-stock")
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts() {
        List<ProductResponse> products = productService.getOutOfStockProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Update product status
     * PATCH /api/v1/products/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProductStatus(
        @PathVariable Integer id,
        @RequestParam ProductStatus status) {
        try {
            ProductResponse updated = productService.updateProductStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

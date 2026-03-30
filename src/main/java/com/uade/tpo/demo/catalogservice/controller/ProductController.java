package com.uade.tpo.demo.catalogservice.controller;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
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
}

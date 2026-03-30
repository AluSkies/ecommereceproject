package com.uade.tpo.demo.catalogservice.entity;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.catalogservice.domain.WatchCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    private Integer id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Integer stock;
    private ProductStatus status;
    private WatchCategory category;
    private Long brandId; // Referencia ciega a Brand
    private String caliber; // Movimiento del reloj
    private String caseSize; // Tamaño de caja (ej: 42mm)
    private String strapMaterial; // Material de banda (ej: leather, stainless steel)
    private List<Image> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product(Integer id, String sku, String name, String slug, String description,
                   BigDecimal price, BigDecimal compareAtPrice, Integer stock,
                   ProductStatus status, WatchCategory category, Long brandId,
                   String caliber, String caseSize, String strapMaterial) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.compareAtPrice = compareAtPrice;
        this.stock = stock;
        this.status = status;
        this.category = category;
        this.brandId = brandId;
        this.caliber = caliber;
        this.caseSize = caseSize;
        this.strapMaterial = strapMaterial;
        this.images = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePrice(BigDecimal newPrice) {
        this.price = newPrice;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStock(Integer newStock) {
        this.stock = newStock;
        this.updatedAt = LocalDateTime.now();
    }

    public void addImage(Image image) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        this.images.add(image);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Image {
        private String url;
        private Integer sortOrder;
        private String altText;
    }
}

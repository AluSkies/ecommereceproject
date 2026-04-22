package com.uade.tpo.demo.catalogservice.entity;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.entity.Category;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "images")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 50, nullable = false)
    private String sku;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(unique = true, length = 150)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "compare_at_price", precision = 12, scale = 2)
    private BigDecimal compareAtPrice;

    @Column(nullable = false)
    private Integer stock;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ProductStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "brand_id")
    private Long brandId;

    @Column(length = 80)
    private String caliber;

    @Column(name = "case_size", length = 80)
    private String caseSize;

    @Column(name = "strap_material", length = 80)
    private String strapMaterial;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * Update product price and refresh timestamp
     */
    public void updatePrice(BigDecimal newPrice) {
        this.price = newPrice;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Update product stock and refresh timestamp
     */
    public void updateStock(Integer newStock) {
        this.stock = newStock != null ? newStock : 0;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Add an image to the product and wire the back-reference so
     * cascade persistence works without additional bookkeeping.
     */
    public void addImage(ProductImage image) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        image.setProduct(this);
        this.images.add(image);
    }

    /**
     * Check if product is currently available for purchase
     */
    public boolean isAvailable() {
        return ProductStatus.ACTIVE == this.status && this.stock != null && this.stock > 0;
    }

    /**
     * Check if product has available stock
     */
    public boolean hasStock() {
        return this.stock != null && this.stock > 0;
    }

    /**
     * Check if product status is active
     */
    public boolean isActive() {
        return ProductStatus.ACTIVE == this.status;
    }

    /**
     * Update product status
     */
    public void setProductStatus(ProductStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }
}

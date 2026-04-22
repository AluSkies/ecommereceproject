package com.uade.tpo.demo.catalogservice.dto;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.catalogservice.domain.WatchCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for product responses (server output).
 * Contains all fields including server-generated metadata (id, status, timestamps).
 * {@code category} (WatchCategory) and {@code categoryCode} (String) are both
 * exposed so existing clients keep working while new ones can read the raw code.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
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
    private String categoryCode;
    private Long brandId;
    private String caliber;
    private String caseSize;
    private String strapMaterial;
    private List<ImageResponse> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * DTO for product images in response
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImageResponse {
        private String url;
        private Integer sortOrder;
        private String altText;
    }
}

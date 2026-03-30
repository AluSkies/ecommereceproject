package com.uade.tpo.demo.catalogservice.dto;

import com.uade.tpo.demo.catalogservice.domain.WatchCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating/updating products (client input)
 * Only contains fields that client should provide
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {
    private String sku;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Integer stock;
    private WatchCategory category;
    private Long brandId;
    private String caliber;
    private String caseSize;
    private String strapMaterial;
    private List<ImageRequest> images;

    /**
     * DTO for product images in request
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImageRequest {
        private String url;
        private Integer sortOrder;
        private String altText;
    }
}

package com.uade.tpo.demo.catalogservice.discount.dto;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for discount responses (server output)
 * Contains all fields including server-generated metadata
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountResponse {
    private Integer id;
    private String code;
    private String description;
    private BigDecimal discountPercentage;
    private DiscountStatus status;
    private LocalDateTime validFromDate;
    private LocalDateTime validUntilDate;
    private Integer maxUsageCount;
    private Integer currentUsageCount;
    private Boolean isCurrentlyValid;       // Computed field: is discount valid now?
    private Boolean hasExpired;             // Computed field: has discount expired?
    private Boolean canBeApplied;           // Computed field: can discount be applied now?
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

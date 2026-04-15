package com.uade.tpo.demo.catalogservice.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating/updating discounts (client input)
 * Only contains fields that client should provide
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountRequest {
    private String code;                    // Unique discount code
    private String description;             // Human-readable description
    private BigDecimal discountPercentage;  // Percentage (0-100)
    private LocalDateTime validFromDate;    // When discount becomes valid
    private LocalDateTime validUntilDate;   // When discount expires
    private Integer maxUsageCount;          // Maximum uses (null = unlimited)
}

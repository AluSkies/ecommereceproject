package com.uade.tpo.demo.catalogservice.discount.dto;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating/updating discounts (client input).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountRequest {
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchase;
    private Integer maxUses;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
}

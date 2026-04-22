package com.uade.tpo.demo.catalogservice.discount.dto;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.domain.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for discount responses (server output).
 * Includes computed {@code valid}/{@code expired} flags so clients don't need
 * to re-implement the validation rules in JS.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountResponse {
    private Integer id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchase;
    private Integer maxUses;
    private Integer usesCount;
    private DiscountStatus status;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private LocalDateTime createdAt;
    private Boolean valid;
    private Boolean expired;
}

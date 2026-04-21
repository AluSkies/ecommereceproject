package com.uade.tpo.demo.purchaseservice.dto.discount;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ApplyDiscountResponse {
    private String code;
    private String name;
    private BigDecimal percentage;
    private BigDecimal discountAmount;
    private BigDecimal originalSubtotal;
    private BigDecimal finalSubtotal;
}

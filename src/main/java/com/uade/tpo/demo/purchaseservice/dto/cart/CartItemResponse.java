package com.uade.tpo.demo.purchaseservice.dto.cart;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Integer productId;
    private String productName;
    private String productSku;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;
}

package com.uade.tpo.demo.purchaseservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    private Integer id;
    private Integer cartId;
    private Integer productId;
    private Integer quantity;
}

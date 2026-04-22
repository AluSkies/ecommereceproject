package com.uade.tpo.demo.purchaseservice.dto.cart;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Integer customerId;
    private String guestToken;
    private Integer productId;
    private Integer quantity;
}

package com.uade.tpo.demo.entity.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Integer customerId;
    private String guestToken;
    private Integer productId;
    private Integer quantity;
}


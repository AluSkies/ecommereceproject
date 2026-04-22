package com.uade.tpo.demo.purchaseservice.dto.cart;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Integer id;
    private Integer customerId;
    private String guestToken;
    private CartStatus status;
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private LocalDateTime expiresAt;
    private LocalDateTime updatedAt;
}

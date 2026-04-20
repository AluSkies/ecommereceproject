package com.uade.tpo.demo.purchaseservice.entity;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    private Integer id;
    private Integer customerId;
    private String guestToken;
    private CartStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    public void addItem(CartItem item) {
        items.stream()
            .filter(i -> i.getProductId().equals(item.getProductId()))
            .findFirst()
            .ifPresentOrElse(
                existing -> existing.setQuantity(existing.getQuantity() + item.getQuantity()),
                () -> items.add(item)
            );
        this.updatedAt = LocalDateTime.now();
    }

    public void removeItem(Integer productId) {
        items.removeIf(i -> i.getProductId().equals(productId));
        this.updatedAt = LocalDateTime.now();
    }

    public void updateItemQuantity(Integer productId, Integer quantity) {
        items.stream()
            .filter(i -> i.getProductId().equals(productId))
            .findFirst()
            .ifPresent(i -> i.setQuantity(quantity));
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }
}

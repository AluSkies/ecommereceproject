package com.uade.tpo.demo.purchaseservice.entity;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Cart JPA entity mapped to the carts table.
 * Represents a user or guest shopping cart with its line items.
 */
@Entity
@Table(name = "carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "guest_token", length = 100)
    private String guestToken;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private CartStatus status;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    /**
     * Add a CartItem to the cart. If a line item for the same product already
     * exists, its quantity is incremented instead of adding a duplicate row.
     */
    public void addItem(CartItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }
        Integer incomingProductId = item.getProductId();
        CartItem existing = null;
        if (incomingProductId != null) {
            for (CartItem i : items) {
                if (incomingProductId.equals(i.getProductId())) {
                    existing = i;
                    break;
                }
            }
        }
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + item.getQuantity());
        } else {
            item.setCart(this);
            items.add(item);
        }
    }

    /**
     * Remove the line item matching the given productId (if any).
     */
    public void removeItem(Integer productId) {
        if (items == null || productId == null) {
            return;
        }
        items.removeIf(i -> productId.equals(i.getProductId()));
    }

    /**
     * Update the quantity of the line item for the given product.
     */
    public void updateItemQuantity(Integer productId, Integer quantity) {
        if (items == null || productId == null) {
            return;
        }
        for (CartItem i : items) {
            if (productId.equals(i.getProductId())) {
                i.setQuantity(quantity);
                return;
            }
        }
    }

    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }
}

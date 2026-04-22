package com.uade.tpo.demo.purchaseservice.entity;

import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
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
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order JPA entity mapped to the orders table.
 * Represents a finalized purchase created from a Cart via checkout.
 */
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"items", "statusHistory"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false, length = 40)
    private String orderNumber;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private OrderStatus status;

    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_total", precision = 12, scale = 2)
    private BigDecimal discountTotal;

    @Column(name = "shipping_total", precision = 12, scale = 2)
    private BigDecimal shippingTotal;

    @Column(name = "tax_total", precision = 12, scale = 2)
    private BigDecimal taxTotal;

    @Column(name = "grand_total", precision = 12, scale = 2)
    private BigDecimal grandTotal;

    @Column(length = 3)
    private String currency;

    @Column(name = "shipping_snapshot", columnDefinition = "JSON")
    private String shippingSnapshot;

    @Column(name = "placed_at")
    private LocalDateTime placedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    /**
     * Add an OrderItem and wire the back-reference so cascade persistence works.
     */
    public void addItem(OrderItem item) {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        item.setOrder(this);
        this.items.add(item);
    }

    /**
     * Add an OrderStatusHistory entry and wire the back-reference.
     */
    public void addStatusHistory(OrderStatusHistory entry) {
        if (this.statusHistory == null) {
            this.statusHistory = new ArrayList<>();
        }
        entry.setOrder(this);
        this.statusHistory.add(entry);
    }
}

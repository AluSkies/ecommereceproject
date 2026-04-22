package com.uade.tpo.demo.catalogservice.discount.entity;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.domain.DiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Discount entity — canonical JPA representation of the {@code discounts} table.
 *
 * <p>Supersedes the legacy {@code purchaseservice.entity.Discount}. Supports both
 * catalog admin management (create/update/delete) and order validation
 * ({@link #isValid()}, {@link #calculateDiscount(BigDecimal)}).</p>
 */
@Entity
@Table(name = "discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 30, nullable = false)
    private String code;

    @Column(length = 200)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", length = 20, nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_purchase", precision = 12, scale = 2)
    private BigDecimal minPurchase;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "uses_count", nullable = false)
    @Builder.Default
    private Integer usesCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private DiscountStatus status;

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    /**
     * A discount is valid when it is ACTIVE, the current moment is inside the
     * {@code [validFrom, validUntil]} window (nulls are treated as "open"), and
     * it has not exhausted its usage cap (if one was set).
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        if (status != DiscountStatus.ACTIVE) {
            return false;
        }
        if (validFrom != null && now.isBefore(validFrom)) {
            return false;
        }
        if (validUntil != null && now.isAfter(validUntil)) {
            return false;
        }
        return maxUses == null || (usesCount != null && usesCount < maxUses);
    }

    /**
     * Check whether the discount's validity window has closed.
     */
    public boolean isExpired() {
        return validUntil != null && validUntil.isBefore(LocalDateTime.now());
    }

    /**
     * Compute the discount amount for a given subtotal.
     *
     * <ul>
     *   <li>{@link DiscountType#PERCENTAGE}: {@code subtotal * discountValue / 100}.</li>
     *   <li>{@link DiscountType#FIXED}: {@code min(discountValue, subtotal)} so the
     *       resulting order total never goes below zero.</li>
     * </ul>
     */
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0 || discountValue == null) {
            return BigDecimal.ZERO;
        }
        if (discountType == DiscountType.PERCENTAGE) {
            return subtotal.multiply(discountValue)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }
        // FIXED — capped by subtotal.
        return discountValue.min(subtotal);
    }
}

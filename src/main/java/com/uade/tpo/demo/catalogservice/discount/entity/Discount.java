package com.uade.tpo.demo.catalogservice.discount.entity;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Discount entity representing promotional discounts applied to products
 * Tracks discount code, percentage, and validity period
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount {
    private Integer id;
    private String code;                      // Unique discount code (e.g., "SUMMER2024", "WELCOME10")
    private String description;               // Human-readable description
    private BigDecimal discountPercentage;    // Percentage value (0-100)
    private DiscountStatus status;            // Current status of the discount
    private LocalDateTime validFromDate;      // When the discount becomes valid
    private LocalDateTime validUntilDate;     // When the discount expires
    private Integer maxUsageCount;            // Maximum number of times discount can be used (null = unlimited)
    private Integer currentUsageCount;        // Current usage count
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Check if discount is currently valid (within date range and active status)
     */
    public boolean isCurrentlyValid() {
        LocalDateTime now = LocalDateTime.now();
        return DiscountStatus.ACTIVE == this.status
            && now.isAfter(validFromDate)
            && now.isBefore(validUntilDate);
    }

    /**
     * Check if discount has expired
     */
    public boolean hasExpired() {
        return LocalDateTime.now().isAfter(validUntilDate);
    }

    /**
     * Check if discount hasn't started yet
     */
    public boolean isScheduled() {
        return LocalDateTime.now().isBefore(validFromDate);
    }

    /**
     * Check if discount has reached max usage limit
     */
    public boolean hasReachedMaxUsage() {
        return maxUsageCount != null && currentUsageCount >= maxUsageCount;
    }

    /**
     * Increment usage count when discount is applied
     */
    public void incrementUsageCount() {
        if (this.currentUsageCount == null) {
            this.currentUsageCount = 0;
        }
        this.currentUsageCount++;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Check if discount can be applied:
     * - Status must be ACTIVE
     * - Must be within validity dates
     * - Must not have reached max usage
     */
    public boolean canBeApplied() {
        return isCurrentlyValid() && !hasReachedMaxUsage();
    }

    /**
     * Update discount status and refresh timestamp
     */
    public void updateStatus(DiscountStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Calculate discount amount for a given price
     */
    public BigDecimal calculateDiscountAmount(BigDecimal originalPrice) {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return originalPrice.multiply(discountPercentage).divide(new BigDecimal("100"), BigDecimal.ROUND_HALF_UP);
    }

    /**
     * Calculate final price after applying discount
     */
    public BigDecimal calculateFinalPrice(BigDecimal originalPrice) {
        if (!canBeApplied()) {
            return originalPrice;
        }
        return originalPrice.subtract(calculateDiscountAmount(originalPrice));
    }
}

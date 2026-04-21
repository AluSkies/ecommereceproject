package com.uade.tpo.demo.catalogservice.discount.service;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.dto.DiscountRequest;
import com.uade.tpo.demo.catalogservice.discount.dto.DiscountResponse;
import com.uade.tpo.demo.catalogservice.discount.entity.Discount;
import com.uade.tpo.demo.repository.DiscountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Business logic service for discount management
 * Handles creation, validation, and application of discounts
 * Separates business rules from data persistence and HTTP concerns
 */
@Service
public class DiscountService {
    private final DiscountRepository discountRepository;

    public DiscountService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    /**
     * Create a new discount
     * Validates: unique code, valid date range, positive percentage
     */
    public DiscountResponse createDiscount(DiscountRequest request) {
        validateDiscountRequest(request);

        if (discountRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Discount code already exists: " + request.getCode());
        }

        Discount discount = new Discount(
            null,
            request.getCode(),
            request.getDescription(),
            request.getDiscountPercentage(),
            DiscountStatus.INACTIVE,
            request.getValidFromDate(),
            request.getValidUntilDate(),
            request.getMaxUsageCount(),
            0,
            LocalDateTime.now(),
            LocalDateTime.now()
        );

        Discount saved = discountRepository.save(discount);
        return toResponse(saved);
    }

    /**
     * Get discount by ID
     */
    public Optional<DiscountResponse> getDiscountById(Integer id) {
        return discountRepository.findById(id).map(this::toResponse);
    }

    /**
     * Get discount by code (useful for applying discounts)
     */
    public Optional<DiscountResponse> getDiscountByCode(String code) {
        return discountRepository.findByCode(code).map(this::toResponse);
    }

    /**
     * Get all discounts
     */
    public List<DiscountResponse> getAllDiscounts() {
        return discountRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get currently active and valid discounts (can be applied now)
     */
    public List<DiscountResponse> getActiveAndValidDiscounts() {
        return discountRepository.findActiveAndValid().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get discounts by status
     */
    public List<DiscountResponse> getDiscountsByStatus(DiscountStatus status) {
        return discountRepository.findByStatus(status).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get expired discounts
     */
    public List<DiscountResponse> getExpiredDiscounts() {
        return discountRepository.findExpired().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get scheduled (future) discounts
     */
    public List<DiscountResponse> getScheduledDiscounts() {
        return discountRepository.findScheduled().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Update discount
     */
    public DiscountResponse updateDiscount(Integer id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));

        validateDiscountRequest(request);

        // Check if code is being changed and if new code already exists
        if (!discount.getCode().equals(request.getCode()) 
            && discountRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Discount code already exists: " + request.getCode());
        }

        discount.setCode(request.getCode());
        discount.setDescription(request.getDescription());
        discount.setDiscountPercentage(request.getDiscountPercentage());
        discount.setValidFromDate(request.getValidFromDate());
        discount.setValidUntilDate(request.getValidUntilDate());
        discount.setMaxUsageCount(request.getMaxUsageCount());
        discount.setUpdatedAt(LocalDateTime.now());

        Discount updated = discountRepository.save(discount);
        return toResponse(updated);
    }

    /**
     * Activate discount (change status to ACTIVE)
     */
    public DiscountResponse activateDiscount(Integer id) {
        Discount discount = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));

        discount.updateStatus(DiscountStatus.ACTIVE);
        Discount updated = discountRepository.save(discount);
        return toResponse(updated);
    }

    /**
     * Deactivate discount (change status to INACTIVE)
     */
    public DiscountResponse deactivateDiscount(Integer id) {
        Discount discount = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));

        discount.updateStatus(DiscountStatus.INACTIVE);
        Discount updated = discountRepository.save(discount);
        return toResponse(updated);
    }

    /**
     * Delete discount
     */
    public void deleteDiscount(Integer id) {
        discountRepository.delete(id);
    }

    /**
     * Apply discount to a price
     * Returns the discount amount and final price
     * Throws exception if discount cannot be applied
     */
    public DiscountApplicationResult applyDiscount(String discountCode, BigDecimal originalPrice) {
        Discount discount = discountRepository.findByCode(discountCode)
            .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + discountCode));

        if (!discount.canBeApplied()) {
            throw new IllegalArgumentException("Discount cannot be applied: " + discountCode);
        }

        BigDecimal discountAmount = discount.calculateDiscountAmount(originalPrice);
        BigDecimal finalPrice = originalPrice.subtract(discountAmount);

        // Increment usage count
        discount.incrementUsageCount();
        discountRepository.save(discount);

        return new DiscountApplicationResult(
            discount.getCode(),
            discount.getDiscountPercentage(),
            discountAmount,
            finalPrice
        );
    }

    /**
     * Try to apply discount without throwing exception if it fails
     * Returns empty Optional if discount cannot be applied
     */
    public Optional<DiscountApplicationResult> tryApplyDiscount(String discountCode, BigDecimal originalPrice) {
        try {
            return Optional.of(applyDiscount(discountCode, originalPrice));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    /**
     * Validate discount request fields
     */
    private void validateDiscountRequest(DiscountRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Discount code cannot be empty");
        }

        if (request.getDiscountPercentage() == null) {
            throw new IllegalArgumentException("Discount percentage is required");
        }

        if (request.getDiscountPercentage().compareTo(BigDecimal.ZERO) < 0 
            || request.getDiscountPercentage().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
        }

        if (request.getValidFromDate() == null || request.getValidUntilDate() == null) {
            throw new IllegalArgumentException("Valid dates are required");
        }

        if (!request.getValidFromDate().isBefore(request.getValidUntilDate())) {
            throw new IllegalArgumentException("Valid from date must be before valid until date");
        }

        if (request.getMaxUsageCount() != null && request.getMaxUsageCount() < 0) {
            throw new IllegalArgumentException("Max usage count cannot be negative");
        }
    }

    /**
     * Convert Discount entity to DiscountResponse DTO
     * Includes computed fields (isCurrentlyValid, hasExpired, canBeApplied)
     */
    private DiscountResponse toResponse(Discount discount) {
        return DiscountResponse.builder()
            .id(discount.getId())
            .code(discount.getCode())
            .description(discount.getDescription())
            .discountPercentage(discount.getDiscountPercentage())
            .status(discount.getStatus())
            .validFromDate(discount.getValidFromDate())
            .validUntilDate(discount.getValidUntilDate())
            .maxUsageCount(discount.getMaxUsageCount())
            .currentUsageCount(discount.getCurrentUsageCount())
            .isCurrentlyValid(discount.isCurrentlyValid())
            .hasExpired(discount.hasExpired())
            .canBeApplied(discount.canBeApplied())
            .createdAt(discount.getCreatedAt())
            .updatedAt(discount.getUpdatedAt())
            .build();
    }

    /**
     * Inner class representing the result of a discount application
     */
    public static class DiscountApplicationResult {
        private final String discountCode;
        private final BigDecimal discountPercentage;
        private final BigDecimal discountAmount;
        private final BigDecimal finalPrice;

        public DiscountApplicationResult(String discountCode, BigDecimal discountPercentage,
                                       BigDecimal discountAmount, BigDecimal finalPrice) {
            this.discountCode = discountCode;
            this.discountPercentage = discountPercentage;
            this.discountAmount = discountAmount;
            this.finalPrice = finalPrice;
        }

        public String getDiscountCode() {
            return discountCode;
        }

        public BigDecimal getDiscountPercentage() {
            return discountPercentage;
        }

        public BigDecimal getDiscountAmount() {
            return discountAmount;
        }

        public BigDecimal getFinalPrice() {
            return finalPrice;
        }
    }
}

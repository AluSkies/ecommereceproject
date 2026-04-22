package com.uade.tpo.demo.catalogservice.discount.service;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.domain.DiscountType;
import com.uade.tpo.demo.catalogservice.discount.dto.DiscountRequest;
import com.uade.tpo.demo.catalogservice.discount.dto.DiscountResponse;
import com.uade.tpo.demo.catalogservice.discount.entity.Discount;
import com.uade.tpo.demo.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Business logic service for discount management backed by JPA persistence.
 *
 * <p>Exposes {@link #findValidByCode(String)} as the integration point used by
 * the order service (written by a parallel agent) to attach a discount to a new
 * order while it is being placed.</p>
 */
@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;

    /**
     * Create a new discount.
     */
    @Transactional
    public DiscountResponse createDiscount(DiscountRequest request) {
        validateDiscountRequest(request);

        if (discountRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Discount code already exists: " + request.getCode());
        }

        Discount discount = Discount.builder()
            .code(request.getCode())
            .description(request.getDescription())
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .minPurchase(request.getMinPurchase())
            .maxUses(request.getMaxUses())
            .usesCount(0)
            .status(DiscountStatus.ACTIVE)
            .validFrom(request.getValidFrom())
            .validUntil(request.getValidUntil())
            .build();

        return toResponse(discountRepository.save(discount));
    }

    /**
     * Get discount by ID
     */
    @Transactional(readOnly = true)
    public Optional<DiscountResponse> getDiscountById(Integer id) {
        return discountRepository.findById(id).map(this::toResponse);
    }

    /**
     * Get discount by code
     */
    @Transactional(readOnly = true)
    public Optional<DiscountResponse> getDiscountByCode(String code) {
        return discountRepository.findByCode(code).map(this::toResponse);
    }

    /**
     * Get all discounts
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getAllDiscounts() {
        return discountRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get currently active and valid discounts (applicable right now).
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getActiveAndValidDiscounts() {
        return discountRepository.findActiveAndValid(LocalDateTime.now()).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get discounts by status
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getDiscountsByStatus(DiscountStatus status) {
        return discountRepository.findByStatus(status).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get expired discounts
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getExpiredDiscounts() {
        return discountRepository.findExpired(LocalDateTime.now()).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get scheduled (future) discounts
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getScheduledDiscounts() {
        return discountRepository.findScheduled(LocalDateTime.now()).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Update a discount's editable fields.
     */
    @Transactional
    public DiscountResponse updateDiscount(Integer id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));

        validateDiscountRequest(request);

        if (!discount.getCode().equals(request.getCode())
            && discountRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Discount code already exists: " + request.getCode());
        }

        discount.setCode(request.getCode());
        discount.setDescription(request.getDescription());
        discount.setDiscountType(request.getDiscountType());
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinPurchase(request.getMinPurchase());
        discount.setMaxUses(request.getMaxUses());
        discount.setValidFrom(request.getValidFrom());
        discount.setValidUntil(request.getValidUntil());

        return toResponse(discountRepository.save(discount));
    }

    /**
     * Activate discount (status -&gt; ACTIVE).
     */
    @Transactional
    public DiscountResponse activateDiscount(Integer id) {
        Discount discount = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));
        discount.setStatus(DiscountStatus.ACTIVE);
        return toResponse(discountRepository.save(discount));
    }

    /**
     * Deactivate discount (status -&gt; DISABLED).
     */
    @Transactional
    public DiscountResponse deactivateDiscount(Integer id) {
        Discount discount = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));
        discount.setStatus(DiscountStatus.DISABLED);
        return toResponse(discountRepository.save(discount));
    }

    /**
     * Delete discount
     */
    @Transactional
    public void deleteDiscount(Integer id) {
        discountRepository.deleteById(id);
    }

    /**
     * Integration point for the order service: find a discount by code only if
     * it is valid right now.
     */
    @Transactional(readOnly = true)
    public Optional<Discount> findValidByCode(String code) {
        return discountRepository.findByCode(code)
            .filter(Discount::isValid);
    }

    /**
     * Validate the input shape for create/update operations.
     */
    private void validateDiscountRequest(DiscountRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Discount code cannot be empty");
        }
        if (request.getDiscountType() == null) {
            throw new IllegalArgumentException("Discount type is required");
        }
        if (request.getDiscountValue() == null
            || request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Discount value must be positive");
        }
        if (request.getDiscountType() == DiscountType.PERCENTAGE
            && request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100");
        }
        if (request.getValidFrom() != null && request.getValidUntil() != null
            && !request.getValidFrom().isBefore(request.getValidUntil())) {
            throw new IllegalArgumentException("Valid from date must be before valid until date");
        }
        if (request.getMaxUses() != null && request.getMaxUses() < 0) {
            throw new IllegalArgumentException("Max uses count cannot be negative");
        }
    }

    /**
     * Convert Discount entity to DiscountResponse DTO
     */
    private DiscountResponse toResponse(Discount discount) {
        return DiscountResponse.builder()
            .id(discount.getId())
            .code(discount.getCode())
            .description(discount.getDescription())
            .discountType(discount.getDiscountType())
            .discountValue(discount.getDiscountValue())
            .minPurchase(discount.getMinPurchase())
            .maxUses(discount.getMaxUses())
            .usesCount(discount.getUsesCount())
            .status(discount.getStatus())
            .validFrom(discount.getValidFrom())
            .validUntil(discount.getValidUntil())
            .createdAt(discount.getCreatedAt())
            .valid(discount.isValid())
            .expired(discount.isExpired())
            .build();
    }
}

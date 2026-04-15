package com.uade.tpo.demo.repository;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.entity.Discount;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Repository for discount persistence and retrieval
 * Currently uses in-memory storage; can be migrated to JPA/database later
 */
@Repository
public class DiscountRepository {
    private final List<Discount> discounts;
    private Integer nextId = 1;

    public DiscountRepository() {
        this.discounts = new ArrayList<>();
        initializeSampleData();
    }

    private void initializeSampleData() {
        // Sample active discount
        Discount summer = new Discount(
            nextId++,
            "SUMMER2024",
            "Summer promotional campaign",
            new java.math.BigDecimal("15"),
            DiscountStatus.ACTIVE,
            LocalDateTime.now().minusDays(10),
            LocalDateTime.now().plusDays(30),
            1000,
            250,
            LocalDateTime.now().minusDays(10),
            LocalDateTime.now()
        );
        discounts.add(summer);

        // Sample new customer discount
        Discount welcome = new Discount(
            nextId++,
            "WELCOME10",
            "Welcome discount for new customers",
            new java.math.BigDecimal("10"),
            DiscountStatus.ACTIVE,
            LocalDateTime.now(),
            LocalDateTime.now().plusDays(90),
            null, // unlimited uses
            0,
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        discounts.add(welcome);

        // Sample scheduled discount
        Discount blackFriday = new Discount(
            nextId++,
            "BLACKFRIDAY2024",
            "Black Friday mega sale",
            new java.math.BigDecimal("30"),
            DiscountStatus.SCHEDULED,
            LocalDateTime.now().plusDays(45),
            LocalDateTime.now().plusDays(48),
            500,
            0,
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        discounts.add(blackFriday);
    }

    /**
     * Save discount (creates or updates)
     */
    public Discount save(Discount discount) {
        if (discount.getId() == null) {
            discount.setId(nextId++);
            discount.setCurrentUsageCount(0);
            discounts.add(discount);
        } else {
            discounts.stream()
                .filter(d -> d.getId().equals(discount.getId()))
                .findFirst()
                .ifPresent(d -> {
                    int index = discounts.indexOf(d);
                    discounts.set(index, discount);
                });
        }
        return discount;
    }

    /**
     * Find discount by ID
     */
    public Optional<Discount> findById(Integer id) {
        return discounts.stream()
            .filter(d -> d.getId().equals(id))
            .findFirst();
    }

    /**
     * Find discount by code
     */
    public Optional<Discount> findByCode(String code) {
        return discounts.stream()
            .filter(d -> d.getCode().equalsIgnoreCase(code))
            .findFirst();
    }

    /**
     * Get all discounts
     */
    public List<Discount> findAll() {
        return new ArrayList<>(discounts);
    }

    /**
     * Find discounts by status
     */
    public List<Discount> findByStatus(DiscountStatus status) {
        return discounts.stream()
            .filter(d -> d.getStatus() == status)
            .collect(Collectors.toList());
    }

    /**
     * Find currently active and valid discounts (can be applied now)
     */
    public List<Discount> findActiveAndValid() {
        return discounts.stream()
            .filter(Discount::canBeApplied)
            .collect(Collectors.toList());
    }

    /**
     * Find expired discounts
     */
    public List<Discount> findExpired() {
        return discounts.stream()
            .filter(Discount::hasExpired)
            .collect(Collectors.toList());
    }

    /**
     * Find scheduled (future) discounts
     */
    public List<Discount> findScheduled() {
        return discounts.stream()
            .filter(Discount::isScheduled)
            .collect(Collectors.toList());
    }

    /**
     * Find discounts by date range
     */
    public List<Discount> findByDateRange(LocalDateTime from, LocalDateTime to) {
        return discounts.stream()
            .filter(d -> !d.getValidFromDate().isAfter(to) && !d.getValidUntilDate().isBefore(from))
            .collect(Collectors.toList());
    }

    /**
     * Delete discount by ID
     */
    public void delete(Integer id) {
        discounts.removeIf(d -> d.getId().equals(id));
    }

    /**
     * Check if discount code already exists
     */
    public boolean existsByCode(String code) {
        return discounts.stream()
            .anyMatch(d -> d.getCode().equalsIgnoreCase(code));
    }

    /**
     * Check if discount code exists (excluding a specific ID for updates)
     */
    public boolean existsByCodeExcluding(String code, Integer excludeId) {
        return discounts.stream()
            .filter(d -> !d.getId().equals(excludeId))
            .anyMatch(d -> d.getCode().equalsIgnoreCase(code));
    }
}

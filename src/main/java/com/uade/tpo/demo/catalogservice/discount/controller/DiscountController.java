package com.uade.tpo.demo.catalogservice.discount.controller;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.dto.DiscountRequest;
import com.uade.tpo.demo.catalogservice.discount.dto.DiscountResponse;
import com.uade.tpo.demo.catalogservice.discount.service.DiscountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for discount management
 * Handles HTTP requests for creating, updating, retrieving, and applying discounts
 */
@RestController
@RequestMapping("/api/v1/discounts")
@PreAuthorize("hasRole('ADMIN')")
public class DiscountController {
    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    /**
     * Create a new discount
     * POST /api/v1/discounts
     */
    @PostMapping
    public ResponseEntity<DiscountResponse> createDiscount(@RequestBody DiscountRequest request) {
        try {
            DiscountResponse created = discountService.createDiscount(request);
            return ResponseEntity.created(URI.create("/api/v1/discounts/" + created.getId())).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all discounts
     * GET /api/v1/discounts
     */
    @GetMapping
    public ResponseEntity<List<DiscountResponse>> getAllDiscounts() {
        List<DiscountResponse> discounts = discountService.getAllDiscounts();
        return ResponseEntity.ok(discounts);
    }

    /**
     * Get discount by ID
     * GET /api/v1/discounts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DiscountResponse> getDiscountById(@PathVariable Integer id) {
        Optional<DiscountResponse> discount = discountService.getDiscountById(id);
        return discount.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get discount by code
     * GET /api/v1/discounts/code/{code}
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<DiscountResponse> getDiscountByCode(@PathVariable String code) {
        Optional<DiscountResponse> discount = discountService.getDiscountByCode(code);
        return discount.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get active and valid discounts (can be applied now)
     * GET /api/v1/discounts/active/valid
     */
    @GetMapping("/active/valid")
    public ResponseEntity<List<DiscountResponse>> getActiveAndValidDiscounts() {
        List<DiscountResponse> discounts = discountService.getActiveAndValidDiscounts();
        return ResponseEntity.ok(discounts);
    }

    /**
     * Get discounts by status
     * GET /api/v1/discounts/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<DiscountResponse>> getDiscountsByStatus(@PathVariable DiscountStatus status) {
        List<DiscountResponse> discounts = discountService.getDiscountsByStatus(status);
        return ResponseEntity.ok(discounts);
    }

    /**
     * Get expired discounts
     * GET /api/v1/discounts/expired
     */
    @GetMapping("/expired")
    public ResponseEntity<List<DiscountResponse>> getExpiredDiscounts() {
        List<DiscountResponse> discounts = discountService.getExpiredDiscounts();
        return ResponseEntity.ok(discounts);
    }

    /**
     * Get scheduled (future) discounts
     * GET /api/v1/discounts/scheduled
     */
    @GetMapping("/scheduled")
    public ResponseEntity<List<DiscountResponse>> getScheduledDiscounts() {
        List<DiscountResponse> discounts = discountService.getScheduledDiscounts();
        return ResponseEntity.ok(discounts);
    }

    /**
     * Update discount
     * PUT /api/v1/discounts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DiscountResponse> updateDiscount(
        @PathVariable Integer id,
        @RequestBody DiscountRequest request) {
        try {
            DiscountResponse updated = discountService.updateDiscount(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Activate discount
     * PATCH /api/v1/discounts/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<DiscountResponse> activateDiscount(@PathVariable Integer id) {
        try {
            DiscountResponse updated = discountService.activateDiscount(id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Deactivate discount
     * PATCH /api/v1/discounts/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<DiscountResponse> deactivateDiscount(@PathVariable Integer id) {
        try {
            DiscountResponse updated = discountService.deactivateDiscount(id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete discount
     * DELETE /api/v1/discounts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable Integer id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.noContent().build();
    }
}

package com.uade.tpo.demo.purchaseservice.controller;

import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountResponse;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountResponse;
import com.uade.tpo.demo.purchaseservice.service.DiscountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/discounts")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    /**
     * Crear cupón de descuento (admin)
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
     * Listar todos los cupones (admin)
     * GET /api/v1/discounts
     */
    @GetMapping
    public ResponseEntity<List<DiscountResponse>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    /**
     * Listar solo cupones activos y vigentes
     * GET /api/v1/discounts/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<DiscountResponse>> getActiveDiscounts() {
        return ResponseEntity.ok(discountService.getActiveDiscounts());
    }

    /**
     * Obtener cupón por ID
     * GET /api/v1/discounts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DiscountResponse> getDiscount(@PathVariable Integer id) {
        return discountService.getById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Validar y aplicar cupón sobre un subtotal
     * POST /api/v1/discounts/apply?subtotal=1000
     */
    @PostMapping("/apply")
    public ResponseEntity<ApplyDiscountResponse> applyDiscount(
        @RequestParam BigDecimal subtotal,
        @RequestBody ApplyDiscountRequest request) {
        try {
            return ResponseEntity.ok(discountService.applyDiscount(subtotal, request));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Activar/desactivar cupón
     * PATCH /api/v1/discounts/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<DiscountResponse> toggleDiscount(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(discountService.toggleActive(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Eliminar cupón
     * DELETE /api/v1/discounts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable Integer id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.noContent().build();
    }
}

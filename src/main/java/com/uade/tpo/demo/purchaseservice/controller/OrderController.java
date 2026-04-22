package com.uade.tpo.demo.purchaseservice.controller;

import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import com.uade.tpo.demo.purchaseservice.dto.order.CheckoutRequest;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderResponse;
import com.uade.tpo.demo.purchaseservice.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Realizar checkout (crear orden desde carrito)
     * POST /api/v1/orders/checkout
     */
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestBody CheckoutRequest request) {
        try {
            OrderResponse order = orderService.checkout(request);
            return ResponseEntity.created(URI.create("/api/v1/orders/" + order.getId())).body(order);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ver orden por ID
     * GET /api/v1/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrder(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Ver orden por número de orden
     * GET /api/v1/orders/number/{orderNumber}
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(@PathVariable String orderNumber) {
        try {
            return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Listar órdenes de un cliente
     * GET /api/v1/orders/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    /**
     * Listar todas las órdenes (admin)
     * GET /api/v1/orders
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * Actualizar estado de una orden (admin)
     * PATCH /api/v1/orders/{id}/status
     * Body: { "status": "CONFIRMED", "note": "Pago verificado", "changedBy": 1 }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
        @PathVariable Long id,
        @RequestBody Map<String, Object> body) {
        try {
            OrderStatus status = OrderStatus.valueOf((String) body.get("status"));
            String note = (String) body.getOrDefault("note", "");
            Long changedBy = readLong(body.get("changedBy"));
            return ResponseEntity.ok(orderService.updateStatus(id, status, note, changedBy));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cancelar orden
     * PATCH /api/v1/orders/{id}/cancel
     * Body: { "reason": "Cliente solicitó cancelación", "changedBy": 1 }
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
        @PathVariable Long id,
        @RequestBody Map<String, Object> body) {
        try {
            String reason = (String) body.getOrDefault("reason", "Cancelado por el cliente");
            Long changedBy = readLong(body.get("changedBy"));
            return ResponseEntity.ok(orderService.cancelOrder(id, reason, changedBy));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private Long readLong(Object raw) {
        if (raw == null) return null;
        if (raw instanceof Number n) return n.longValue();
        return Long.parseLong(raw.toString());
    }
}

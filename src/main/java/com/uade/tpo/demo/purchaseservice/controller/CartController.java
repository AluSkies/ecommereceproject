package com.uade.tpo.demo.purchaseservice.controller;

import com.uade.tpo.demo.purchaseservice.dto.cart.AddToCartRequest;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.UpdateCartItemRequest;
import com.uade.tpo.demo.purchaseservice.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Agregar producto al carrito (o crear carrito si no existe)
     * POST /api/v1/cart/items
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@RequestBody AddToCartRequest request) {
        try {
            CartResponse cart = cartService.addItem(request);
            return ResponseEntity.ok(cart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ver carrito por ID
     * GET /api/v1/cart/{cartId}
     */
    @GetMapping("/{cartId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Integer cartId) {
        try {
            return ResponseEntity.ok(cartService.getCart(cartId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Ver carrito activo de un cliente
     * GET /api/v1/cart/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<CartResponse> getCartByCustomer(@PathVariable Integer customerId) {
        try {
            return ResponseEntity.ok(cartService.getActiveCartByCustomer(customerId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Ver carrito de invitado por token
     * GET /api/v1/cart/guest/{guestToken}
     */
    @GetMapping("/guest/{guestToken}")
    public ResponseEntity<CartResponse> getCartByGuestToken(@PathVariable String guestToken) {
        try {
            return ResponseEntity.ok(cartService.getActiveCartByGuestToken(guestToken));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Actualizar cantidad de un item en el carrito
     * PUT /api/v1/cart/{cartId}/items/{productId}
     */
    @PutMapping("/{cartId}/items/{productId}")
    public ResponseEntity<CartResponse> updateItem(
        @PathVariable Integer cartId,
        @PathVariable Integer productId,
        @RequestBody UpdateCartItemRequest request) {
        try {
            return ResponseEntity.ok(cartService.updateItemQuantity(cartId, productId, request));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Eliminar item del carrito
     * DELETE /api/v1/cart/{cartId}/items/{productId}
     */
    @DeleteMapping("/{cartId}/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(
        @PathVariable Integer cartId,
        @PathVariable Integer productId) {
        try {
            return ResponseEntity.ok(cartService.removeItem(cartId, productId));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Vaciar carrito
     * DELETE /api/v1/cart/{cartId}
     */
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> clearCart(@PathVariable Integer cartId) {
        try {
            cartService.clearCart(cartId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

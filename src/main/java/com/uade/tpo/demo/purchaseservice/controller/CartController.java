package com.uade.tpo.demo.purchaseservice.controller;

import com.uade.tpo.demo.purchaseservice.dto.cart.AddToCartRequest;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.UpdateCartItemRequest;
import com.uade.tpo.demo.purchaseservice.service.CartService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para operaciones de carrito
 * REST Controller for cart operations
 */
@RestController
@RequestMapping("/api/v1/cart")
@AllArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    /**
     * Agregar producto al carrito (o crear carrito si no existe)
     * POST /api/v1/cart/items
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@RequestBody AddToCartRequest request) {
        log.info("POST /api/v1/cart/items - Agregar item: producto={}, cantidad={}", 
            request.getProductId(), request.getQuantity());
        CartResponse cart = cartService.addToCart(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    /**
     * Ver carrito por ID
     * GET /api/v1/cart/{cartId}
     */
    @GetMapping("/{cartId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Integer cartId) {
        log.info("GET /api/v1/cart/{} - Obtener carrito", cartId);
        CartResponse cart = cartService.getCartById(cartId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Ver carrito activo de un cliente
     * GET /api/v1/cart/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<CartResponse> getCartByCustomer(@PathVariable Integer customerId) {
        log.info("GET /api/v1/cart/customer/{} - Obtener carrito del cliente", customerId);
        CartResponse cart = cartService.getCartByCustomerId(customerId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Ver carrito de invitado por token
     * GET /api/v1/cart/guest/{guestToken}
     */
    @GetMapping("/guest/{guestToken}")
    public ResponseEntity<CartResponse> getCartByGuestToken(@PathVariable String guestToken) {
        log.info("GET /api/v1/cart/guest/{} - Obtener carrito de invitado", guestToken);
        CartResponse cart = cartService.getCartByGuestToken(guestToken);
        return ResponseEntity.ok(cart);
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
        log.info("PUT /api/v1/cart/{}/items/{} - Actualizar cantidad a {}", 
            cartId, productId, request.getQuantity());
        CartResponse cart = cartService.updateItemQuantity(cartId, productId, request);
        return ResponseEntity.ok(cart);
    }

    /**
     * Eliminar item del carrito
     * DELETE /api/v1/cart/{cartId}/items/{productId}
     */
    @DeleteMapping("/{cartId}/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(
        @PathVariable Integer cartId,
        @PathVariable Integer productId) {
        log.info("DELETE /api/v1/cart/{}/items/{} - Remover item", cartId, productId);
        CartResponse cart = cartService.removeItem(cartId, productId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Vaciar carrito
     * DELETE /api/v1/cart/{cartId}
     */
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> clearCart(@PathVariable Integer cartId) {
        log.info("DELETE /api/v1/cart/{} - Limpiar carrito", cartId);
        cartService.clearCart(cartId);
        return ResponseEntity.noContent().build();
    }
}

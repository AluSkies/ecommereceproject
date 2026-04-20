package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.catalogservice.dto.ProductResponse;
import com.uade.tpo.demo.catalogservice.service.ProductService;
import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.dto.cart.AddToCartRequest;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.UpdateCartItemRequest;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import com.uade.tpo.demo.purchaseservice.entity.CartItem;
import com.uade.tpo.demo.purchaseservice.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductService productService;

    public CartService(CartRepository cartRepository, ProductService productService) {
        this.cartRepository = cartRepository;
        this.productService = productService;
    }

    public CartResponse addItem(AddToCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        ProductResponse product = getProductOrThrow(request.getProductId());

        if (product.getStock() < request.getQuantity()) {
            throw new IllegalArgumentException("Stock insuficiente para: " + product.getName());
        }

        Cart cart = findOrCreateCart(request.getCustomerId(), request.getGuestToken());

        CartItem item = CartItem.builder()
            .cartId(cart.getId())
            .productId(product.getId())
            .quantity(request.getQuantity())
            .build();

        cart.addItem(item);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    public CartResponse getCart(Integer cartId) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Carrito no encontrado: " + cartId));
        return toResponse(cart);
    }

    public CartResponse getActiveCartByCustomer(Integer customerId) {
        Cart cart = cartRepository.findActiveByCustomerId(customerId)
            .orElseThrow(() -> new IllegalArgumentException("No hay carrito activo para el cliente: " + customerId));
        return toResponse(cart);
    }

    public CartResponse getActiveCartByGuestToken(String guestToken) {
        Cart cart = cartRepository.findActiveByGuestToken(guestToken)
            .orElseThrow(() -> new IllegalArgumentException("Carrito de invitado no encontrado"));
        return toResponse(cart);
    }

    public CartResponse updateItemQuantity(Integer cartId, Integer productId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Carrito no encontrado: " + cartId));

        if (!CartStatus.ACTIVE.equals(cart.getStatus())) {
            throw new IllegalStateException("El carrito no está activo");
        }

        if (request.getQuantity() <= 0) {
            cart.removeItem(productId);
        } else {
            ProductResponse product = getProductOrThrow(productId);
            if (product.getStock() < request.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para: " + product.getName());
            }
            cart.updateItemQuantity(productId, request.getQuantity());
        }

        cartRepository.save(cart);
        return toResponse(cart);
    }

    public CartResponse removeItem(Integer cartId, Integer productId) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Carrito no encontrado: " + cartId));

        if (!CartStatus.ACTIVE.equals(cart.getStatus())) {
            throw new IllegalStateException("El carrito no está activo");
        }

        cart.removeItem(productId);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    public void clearCart(Integer cartId) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Carrito no encontrado: " + cartId));
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    public void markAsConverted(Integer cartId) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Carrito no encontrado: " + cartId));
        cart.setStatus(CartStatus.CONVERTED);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    // ---- helpers ----

    private Cart findOrCreateCart(Integer customerId, String guestToken) {
        if (customerId != null) {
            return cartRepository.findActiveByCustomerId(customerId)
                .orElseGet(() -> createCart(customerId, null));
        } else if (guestToken != null) {
            return cartRepository.findActiveByGuestToken(guestToken)
                .orElseGet(() -> createCart(null, guestToken));
        }
        throw new IllegalArgumentException("Se requiere customerId o guestToken");
    }

    private Cart createCart(Integer customerId, String guestToken) {
        Cart cart = Cart.builder()
            .customerId(customerId)
            .guestToken(guestToken)
            .status(CartStatus.ACTIVE)
            .expiresAt(LocalDateTime.now().plusDays(7))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return cartRepository.save(cart);
    }

    private ProductResponse getProductOrThrow(Integer productId) {
        return productService.getProductById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + productId));
    }

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
            .map(item -> {
                ProductResponse product = productService.getProductById(item.getProductId())
                    .orElse(null);
                BigDecimal unitPrice = product != null ? product.getPrice() : BigDecimal.ZERO;
                return CartItemResponse.builder()
                    .productId(item.getProductId())
                    .productName(product != null ? product.getName() : "Producto desconocido")
                    .productSku(product != null ? product.getSku() : "")
                    .unitPrice(unitPrice)
                    .quantity(item.getQuantity())
                    .lineTotal(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                    .build();
            })
            .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
            .map(CartItemResponse::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
            .id(cart.getId())
            .customerId(cart.getCustomerId())
            .guestToken(cart.getGuestToken())
            .status(cart.getStatus())
            .items(itemResponses)
            .subtotal(subtotal)
            .expiresAt(cart.getExpiresAt())
            .updatedAt(cart.getUpdatedAt())
            .build();
    }
}

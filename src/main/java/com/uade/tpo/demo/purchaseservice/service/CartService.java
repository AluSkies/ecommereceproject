package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.catalogservice.entity.Product;
import com.uade.tpo.demo.repository.ProductRepository;
import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.dto.cart.AddToCartRequest;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.UpdateCartItemRequest;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import com.uade.tpo.demo.purchaseservice.entity.CartItem;
import com.uade.tpo.demo.purchaseservice.exception.*;
import com.uade.tpo.demo.purchaseservice.repository.CartRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para el carrito
 * Cart business logic service with Spanish exception handling
 */
@Service
@AllArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    private static final int EXPIRATION_DAYS = 7;

    /**
     * Agregar un artículo al carrito (crea carrito si es necesario)
     * Add item to cart (creates cart if needed)
     */
    public CartResponse addToCart(AddToCartRequest request) {
        log.info("Agregando artículo al carrito: producto={}, cantidad={}", 
            request.getProductId(), request.getQuantity());

        // Validar solicitud
        if (request.getProductId() == null) {
            throw new SolicitudInvalidaException("productId");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new CantidadInvalidaException(request.getQuantity());
        }

        if (request.getCustomerId() == null && (request.getGuestToken() == null || request.getGuestToken().isBlank())) {
            throw new SolicitudInvalidaException(
                "Debe proporcionar customerId o guestToken"
            );
        }

        // Obtener producto
        Product producto = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ProductoNoEncontradoException(request.getProductId()));

        // Validar stock
        int stockTotal = request.getQuantity();
        Cart carrito = null;

        if (request.getCustomerId() != null) {
            carrito = cartRepository.findActiveByCustomerId(request.getCustomerId())
                .orElse(null);
            if (carrito != null) {
                // Sumar cantidad existente si el producto ya está en el carrito
                CartItem itemExistente = carrito.getItems().stream()
                    .filter(i -> i.getProductId().equals(request.getProductId()))
                    .findFirst()
                    .orElse(null);
                if (itemExistente != null) {
                    stockTotal += itemExistente.getQuantity();
                }
            }
        } else {
            carrito = cartRepository.findActiveByGuestToken(request.getGuestToken())
                .orElse(null);
            if (carrito != null) {
                CartItem itemExistente = carrito.getItems().stream()
                    .filter(i -> i.getProductId().equals(request.getProductId()))
                    .findFirst()
                    .orElse(null);
                if (itemExistente != null) {
                    stockTotal += itemExistente.getQuantity();
                }
            }
        }

        if (producto.getStock() < stockTotal) {
            throw new StockInsuficienteException(
                producto.getName(),
                stockTotal,
                producto.getStock()
            );
        }

        // Crear carrito si no existe
        if (carrito == null) {
            carrito = crearCarrito(request.getCustomerId(), request.getGuestToken());
        }

        // Agregar artículo
        CartItem item = CartItem.builder()
            .productId(request.getProductId())
            .quantity(request.getQuantity())
            .build();

        carrito.addItem(item);
        Cart carritoGuardado = cartRepository.save(carrito);

        log.info("Artículo agregado exitosamente al carrito {}", carritoGuardado.getId());
        return mapToResponse(carritoGuardado);
    }

    /**
     * Obtener carrito por ID
     * Get cart by ID
     */
    public CartResponse getCartById(Integer carritoId) {
        log.debug("Obteniendo carrito: {}", carritoId);

        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        return mapToResponse(carrito);
    }

    /**
     * Obtener carrito activo del cliente
     * Get active cart for customer
     */
    public CartResponse getCartByCustomerId(Integer customerId) {
        log.debug("Obteniendo carrito para cliente: {}", customerId);

        Cart carrito = cartRepository.findActiveByCustomerId(customerId)
            .orElseThrow(() -> new CarritoNoEncontradoException("cliente", String.valueOf(customerId)));

        return mapToResponse(carrito);
    }

    /**
     * Obtener carrito de invitado
     * Get guest cart
     */
    public CartResponse getCartByGuestToken(String guestToken) {
        log.debug("Obteniendo carrito de invitado: {}", guestToken);

        Cart carrito = cartRepository.findActiveByGuestToken(guestToken)
            .orElseThrow(() -> new CarritoNoEncontradoException("token de invitado", guestToken));

        return mapToResponse(carrito);
    }

    /**
     * Actualizar cantidad de artículo
     * Update item quantity (≤0 removes item)
     */
    public CartResponse updateItemQuantity(Integer carritoId, Integer productoId, UpdateCartItemRequest request) {
        log.info("Actualizando cantidad del artículo: carrito={}, producto={}, nuevaCantidad={}", 
            carritoId, productoId, request.getQuantity());

        if (request.getQuantity() == null) {
            throw new CantidadInvalidaException("Cantidad requerida");
        }

        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        if (!CartStatus.ACTIVE.equals(carrito.getStatus())) {
            throw new CarritoInactivoException(carritoId, carrito.getStatus());
        }

        // Si cantidad es ≤ 0, eliminar el artículo
        if (request.getQuantity() <= 0) {
            carrito.removeItem(productoId);
            log.info("Artículo {} removido del carrito {}", productoId, carritoId);
        } else {
            // Validar producto existe
            Product producto = productRepository.findById(productoId)
                .orElseThrow(() -> new ProductoNoEncontradoException(productoId));

            // Validar stock
            if (producto.getStock() < request.getQuantity()) {
                throw new StockInsuficienteException(
                    producto.getName(),
                    request.getQuantity(),
                    producto.getStock()
                );
            }

            CartItem item = carrito.getItems().stream()
                .filter(i -> i.getProductId().equals(productoId))
                .findFirst()
                .orElseThrow(() -> new ArticuloNoEncontradoException(carritoId, productoId));

            item.setQuantity(request.getQuantity());
            carrito.setUpdatedAt(LocalDateTime.now());
            log.info("Cantidad actualizada para artículo {} a {}", productoId, request.getQuantity());
        }

        Cart carritoActualizado = cartRepository.save(carrito);
        return mapToResponse(carritoActualizado);
    }

    /**
     * Eliminar artículo del carrito
     * Remove item from cart
     */
    public CartResponse removeItem(Integer carritoId, Integer productoId) {
        log.info("Removiendo artículo del carrito: carrito={}, producto={}", carritoId, productoId);

        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        if (!CartStatus.ACTIVE.equals(carrito.getStatus())) {
            throw new CarritoInactivoException(carritoId, carrito.getStatus());
        }

        // Validar que el artículo existe
        if (carrito.getItems().stream().noneMatch(i -> i.getProductId().equals(productoId))) {
            throw new ArticuloNoEncontradoException(carritoId, productoId);
        }

        carrito.removeItem(productoId);
        Cart carritoActualizado = cartRepository.save(carrito);

        log.info("Artículo {} removido exitosamente del carrito {}", productoId, carritoId);
        return mapToResponse(carritoActualizado);
    }

    /**
     * Limpiar carrito (eliminar todos los artículos)
     * Clear cart (remove all items)
     */
    public void clearCart(Integer carritoId) {
        log.info("Limpiando carrito: {}", carritoId);

        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        if (!CartStatus.ACTIVE.equals(carrito.getStatus())) {
            throw new CarritoInactivoException(carritoId, carrito.getStatus());
        }

        carrito.getItems().clear();
        carrito.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(carrito);

        log.info("Carrito {} limpiado exitosamente", carritoId);
    }

    /**
     * Marcar carrito como convertido (se convirtió en orden)
     * Mark cart as converted (became an order)
     */
    public void markAsConverted(Integer carritoId) {
        log.info("Marcando carrito como convertido: {}", carritoId);

        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        carrito.setStatus(CartStatus.CONVERTED);
        cartRepository.save(carrito);

        log.info("Carrito {} marcado como convertido", carritoId);
    }

    /**
     * Crear nuevo carrito
     * Create new cart
     */
    private Cart crearCarrito(Integer customerId, String guestToken) {
        String token = guestToken != null ? guestToken : UUID.randomUUID().toString();
        LocalDateTime ahora = LocalDateTime.now();

        return cartRepository.save(Cart.builder()
            .customerId(customerId)
            .guestToken(token)
            .status(CartStatus.ACTIVE)
            .createdAt(ahora)
            .updatedAt(ahora)
            .expiresAt(ahora.plusDays(EXPIRATION_DAYS))
            .build());
    }

    /**
     * Mapear carrito a DTO con detalles de productos
     * Map cart to response DTO with product details
     */
    private CartResponse mapToResponse(Cart carrito) {
        BigDecimal subtotal = carrito.getItems().stream()
            .map(item -> {
                Product producto = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ProductoNoEncontradoException(item.getProductId()));
                return producto.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        var items = carrito.getItems().stream()
            .map(item -> {
                Product producto = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ProductoNoEncontradoException(item.getProductId()));
                BigDecimal lineTotal = producto.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                return CartItemResponse.builder()
                    .productId(producto.getId())
                    .productName(producto.getName())
                    .productSku(producto.getSku())
                    .unitPrice(producto.getPrice())
                    .quantity(item.getQuantity())
                    .lineTotal(lineTotal)
                    .build();
            })
            .collect(Collectors.toList());

        return CartResponse.builder()
            .id(carrito.getId())
            .customerId(carrito.getCustomerId())
            .guestToken(carrito.getGuestToken())
            .status(carrito.getStatus())
            .items(items)
            .subtotal(subtotal)
            .expiresAt(carrito.getExpiresAt())
            .updatedAt(carrito.getUpdatedAt())
            .build();
    }
}

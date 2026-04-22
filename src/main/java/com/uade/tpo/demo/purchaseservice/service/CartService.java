package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.catalogservice.entity.Product;
import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.dto.cart.AddToCartRequest;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.UpdateCartItemRequest;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import com.uade.tpo.demo.purchaseservice.entity.CartItem;
import com.uade.tpo.demo.purchaseservice.exception.ArticuloNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.exception.CantidadInvalidaException;
import com.uade.tpo.demo.purchaseservice.exception.CarritoInactivoException;
import com.uade.tpo.demo.purchaseservice.exception.CarritoNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.exception.ProductoNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.exception.SolicitudInvalidaException;
import com.uade.tpo.demo.purchaseservice.exception.StockInsuficienteException;
import com.uade.tpo.demo.purchaseservice.repository.CartRepository;
import com.uade.tpo.demo.repository.ProductRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para el carrito (JPA).
 * Cart business logic — fully JPA-backed. The class is transactional so that
 * lazy product/discount associations can be materialised safely while mapping
 * cart responses.
 */
@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    private static final int EXPIRATION_DAYS = 7;

    // ────────────────────────────────────────────────────────────────────────
    // addToCart
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Agregar un artículo al carrito (crea carrito si es necesario)
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
        if (request.getCustomerId() == null
            && (request.getGuestToken() == null || request.getGuestToken().isBlank())) {
            throw new SolicitudInvalidaException("Debe proporcionar customerId o guestToken");
        }

        // Obtener producto (entidad JPA)
        Product producto = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ProductoNoEncontradoException(request.getProductId()));

        // Localizar carrito activo (por userId o guestToken)
        Long userId = request.getCustomerId() != null
            ? request.getCustomerId().longValue()
            : null;

        Cart carrito;
        if (userId != null) {
            carrito = cartRepository.findFirstByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElse(null);
        } else {
            carrito = cartRepository.findFirstByGuestTokenAndStatus(
                request.getGuestToken(), CartStatus.ACTIVE).orElse(null);
        }

        // Calcular cantidad acumulada para validar stock antes de modificar nada
        int cantidadSolicitada = request.getQuantity();
        if (carrito != null) {
            CartItem itemExistente = findItemByProductId(carrito, request.getProductId());
            if (itemExistente != null) {
                cantidadSolicitada += itemExistente.getQuantity();
            }
        }
        if (producto.getStock() == null || producto.getStock() < cantidadSolicitada) {
            throw new StockInsuficienteException(
                producto.getName(),
                cantidadSolicitada,
                producto.getStock() == null ? 0 : producto.getStock()
            );
        }

        // Crear carrito si no existe
        if (carrito == null) {
            carrito = crearCarrito(userId, request.getGuestToken());
        }

        // Merge o nuevo item
        CartItem itemExistente = findItemByProductId(carrito, request.getProductId());
        if (itemExistente != null) {
            itemExistente.setQuantity(itemExistente.getQuantity() + request.getQuantity());
        } else {
            CartItem nuevoItem = CartItem.builder()
                .product(producto)
                .quantity(request.getQuantity())
                .unitPrice(producto.getPrice())
                .build();
            carrito.addItem(nuevoItem);
        }

        Cart carritoGuardado = cartRepository.save(carrito);
        log.info("Artículo agregado exitosamente al carrito {}", carritoGuardado.getId());
        return toResponse(carritoGuardado);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Lookups
    // ────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CartResponse getCartById(Integer carritoId) {
        log.debug("Obteniendo carrito: {}", carritoId);
        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));
        return toResponse(carrito);
    }

    @Transactional(readOnly = true)
    public CartResponse getCartByCustomerId(Integer customerId) {
        log.debug("Obteniendo carrito para cliente: {}", customerId);
        if (customerId == null) {
            throw new SolicitudInvalidaException("customerId");
        }
        Long userId = customerId.longValue();
        Cart carrito = cartRepository.findFirstByUserIdAndStatus(userId, CartStatus.ACTIVE)
            .orElseThrow(() -> new CarritoNoEncontradoException("cliente", String.valueOf(customerId)));
        return toResponse(carrito);
    }

    @Transactional(readOnly = true)
    public CartResponse getCartByGuestToken(String guestToken) {
        log.debug("Obteniendo carrito de invitado: {}", guestToken);
        Cart carrito = cartRepository.findFirstByGuestTokenAndStatus(guestToken, CartStatus.ACTIVE)
            .orElseThrow(() -> new CarritoNoEncontradoException("token de invitado", guestToken));
        return toResponse(carrito);
    }

    // ────────────────────────────────────────────────────────────────────────
    // updateItemQuantity
    // ────────────────────────────────────────────────────────────────────────

    public CartResponse updateItemQuantity(Integer carritoId, Integer productoId, UpdateCartItemRequest request) {
        log.info("Actualizando cantidad del artículo: carrito={}, producto={}, nuevaCantidad={}",
            carritoId, productoId, request != null ? request.getQuantity() : null);

        if (request == null || request.getQuantity() == null) {
            throw new CantidadInvalidaException("Cantidad requerida");
        }

        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        if (!CartStatus.ACTIVE.equals(carrito.getStatus())) {
            throw new CarritoInactivoException(carritoId, carrito.getStatus());
        }

        // Cantidad <= 0 => tratar como eliminación
        if (request.getQuantity() <= 0) {
            if (findItemByProductId(carrito, productoId) == null) {
                throw new ArticuloNoEncontradoException(carritoId, productoId);
            }
            carrito.removeItem(productoId);
            log.info("Artículo {} removido del carrito {} (cantidad <= 0)", productoId, carritoId);
            Cart guardado = cartRepository.save(carrito);
            return toResponse(guardado);
        }

        // Validar producto y stock
        Product producto = productRepository.findById(productoId)
            .orElseThrow(() -> new ProductoNoEncontradoException(productoId));

        if (producto.getStock() == null || producto.getStock() < request.getQuantity()) {
            throw new StockInsuficienteException(
                producto.getName(),
                request.getQuantity(),
                producto.getStock() == null ? 0 : producto.getStock()
            );
        }

        CartItem item = findItemByProductId(carrito, productoId);
        if (item == null) {
            throw new ArticuloNoEncontradoException(carritoId, productoId);
        }
        item.setQuantity(request.getQuantity());
        log.info("Cantidad actualizada para artículo {} a {}", productoId, request.getQuantity());

        Cart guardado = cartRepository.save(carrito);
        return toResponse(guardado);
    }

    // ────────────────────────────────────────────────────────────────────────
    // removeItem / clearCart / markAsConverted
    // ────────────────────────────────────────────────────────────────────────

    public CartResponse removeItem(Integer carritoId, Integer productoId) {
        log.info("Removiendo artículo del carrito: carrito={}, producto={}", carritoId, productoId);

        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        if (!CartStatus.ACTIVE.equals(carrito.getStatus())) {
            throw new CarritoInactivoException(carritoId, carrito.getStatus());
        }
        if (findItemByProductId(carrito, productoId) == null) {
            throw new ArticuloNoEncontradoException(carritoId, productoId);
        }

        carrito.removeItem(productoId);
        Cart guardado = cartRepository.save(carrito);
        log.info("Artículo {} removido exitosamente del carrito {}", productoId, carritoId);
        return toResponse(guardado);
    }

    public void clearCart(Integer carritoId) {
        log.info("Limpiando carrito: {}", carritoId);
        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));

        if (!CartStatus.ACTIVE.equals(carrito.getStatus())) {
            throw new CarritoInactivoException(carritoId, carrito.getStatus());
        }

        carrito.getItems().clear();
        cartRepository.save(carrito);
        log.info("Carrito {} limpiado exitosamente", carritoId);
    }

    public void markAsConverted(Integer carritoId) {
        log.info("Marcando carrito como convertido: {}", carritoId);
        Cart carrito = cartRepository.findById(carritoId)
            .orElseThrow(() -> new CarritoNoEncontradoException(carritoId));
        carrito.setStatus(CartStatus.CONVERTED);
        cartRepository.save(carrito);
        log.info("Carrito {} marcado como convertido", carritoId);
    }

    // ────────────────────────────────────────────────────────────────────────
    // helpers
    // ────────────────────────────────────────────────────────────────────────

    private Cart crearCarrito(Long userId, String guestToken) {
        LocalDateTime ahora = LocalDateTime.now();
        String token = (userId == null)
            ? (guestToken != null ? guestToken : UUID.randomUUID().toString())
            : guestToken;

        Cart nuevo = Cart.builder()
            .userId(userId)
            .guestToken(token)
            .status(CartStatus.ACTIVE)
            .expiresAt(ahora.plusDays(EXPIRATION_DAYS))
            .build();
        return cartRepository.save(nuevo);
    }

    private CartItem findItemByProductId(Cart carrito, Integer productoId) {
        if (carrito.getItems() == null || productoId == null) {
            return null;
        }
        for (CartItem i : carrito.getItems()) {
            if (productoId.equals(i.getProductId())) {
                return i;
            }
        }
        return null;
    }

    /**
     * Mapear carrito a DTO con detalles de productos.
     * Must be called inside a transaction (class-level @Transactional) so that
     * the lazy {@link CartItem#getProduct()} association can be resolved.
     */
    private CartResponse toResponse(Cart carrito) {
        List<CartItem> items = Optional.ofNullable(carrito.getItems()).orElse(List.of());

        List<CartItemResponse> itemResponses = items.stream()
            .map(this::toItemResponse)
            .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
            .map(CartItemResponse::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer customerIdForResponse = carrito.getUserId() != null
            ? carrito.getUserId().intValue()
            : null;

        return CartResponse.builder()
            .id(carrito.getId())
            .customerId(customerIdForResponse)
            .guestToken(carrito.getGuestToken())
            .status(carrito.getStatus())
            .items(itemResponses)
            .subtotal(subtotal)
            .expiresAt(carrito.getExpiresAt())
            .updatedAt(carrito.getUpdatedAt())
            .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        Product producto = item.getProduct();
        // Fallback: if association is missing (shouldn't happen in normal flow),
        // re-fetch from the repository using the back-reference id.
        if (producto == null && item.getProductId() != null) {
            producto = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ProductoNoEncontradoException(item.getProductId()));
        }

        BigDecimal unitPrice = item.getUnitPrice() != null
            ? item.getUnitPrice()
            : (producto != null ? producto.getPrice() : BigDecimal.ZERO);
        Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
        BigDecimal lineTotal = unitPrice != null
            ? unitPrice.multiply(BigDecimal.valueOf(quantity))
            : BigDecimal.ZERO;

        return CartItemResponse.builder()
            .productId(producto != null ? producto.getId() : item.getProductId())
            .productName(producto != null ? producto.getName() : null)
            .productSku(producto != null ? producto.getSku() : null)
            .unitPrice(unitPrice)
            .quantity(quantity)
            .lineTotal(lineTotal)
            .build();
    }
}

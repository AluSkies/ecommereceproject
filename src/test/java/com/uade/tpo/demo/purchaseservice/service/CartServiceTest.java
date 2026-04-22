package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.catalogservice.entity.Product;
import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.dto.cart.AddToCartRequest;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.UpdateCartItemRequest;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import com.uade.tpo.demo.purchaseservice.entity.CartItem;
import com.uade.tpo.demo.purchaseservice.exception.CantidadInvalidaException;
import com.uade.tpo.demo.purchaseservice.exception.CarritoInactivoException;
import com.uade.tpo.demo.purchaseservice.exception.CarritoNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.exception.ProductoNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.exception.SolicitudInvalidaException;
import com.uade.tpo.demo.purchaseservice.exception.StockInsuficienteException;
import com.uade.tpo.demo.purchaseservice.repository.CartRepository;
import com.uade.tpo.demo.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CartService")
class CartServiceTest {

    @Mock CartRepository cartRepository;
    @Mock ProductRepository productRepository;
    @InjectMocks CartService cartService;

    private Product productRolex;
    private Cart activeCart;

    @BeforeEach
    void setup() {
        productRolex = Product.builder()
            .id(1)
            .sku("ROLEX-001")
            .name("Rolex Submariner")
            .price(new BigDecimal("9500.00"))
            .stock(10)
            .build();

        activeCart = Cart.builder()
            .id(1)
            .userId(42L)
            .status(CartStatus.ACTIVE)
            .expiresAt(LocalDateTime.now().plusDays(7))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .items(new ArrayList<>())
            .build();
    }

    // ──────────────────────────────────────────────────
    // addItem
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("addItem")
    class AddItem {

        @Test
        @DisplayName("crea un carrito nuevo cuando el cliente no tiene uno activo")
        void createsNewCartWhenNoneExists() {
            AddToCartRequest req = buildRequest(42, null, 1, 2);

            when(productRepository.findById(1)).thenReturn(Optional.of(productRolex));
            when(cartRepository.findFirstByUserIdAndStatus(42L, CartStatus.ACTIVE))
                .thenReturn(Optional.empty());
            when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> {
                Cart c = inv.getArgument(0);
                if (c.getId() == null) c.setId(1);
                return c;
            });

            CartResponse resp = cartService.addToCart(req);

            assertThat(resp.getCustomerId()).isEqualTo(42);
            assertThat(resp.getStatus()).isEqualTo(CartStatus.ACTIVE);
            assertThat(resp.getItems()).hasSize(1);
            assertThat(resp.getItems().get(0).getQuantity()).isEqualTo(2);
            verify(cartRepository, atLeastOnce()).save(any(Cart.class));
        }

        @Test
        @DisplayName("reutiliza el carrito activo existente y acumula cantidad si el producto ya está")
        void mergesQuantityWhenProductAlreadyInCart() {
            CartItem existing = CartItem.builder()
                .cart(activeCart)
                .product(productRolex)
                .quantity(3)
                .unitPrice(productRolex.getPrice())
                .build();
            activeCart.getItems().add(existing);

            AddToCartRequest req = buildRequest(42, null, 1, 2);

            when(productRepository.findById(1)).thenReturn(Optional.of(productRolex));
            when(cartRepository.findFirstByUserIdAndStatus(42L, CartStatus.ACTIVE))
                .thenReturn(Optional.of(activeCart));
            when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

            CartResponse resp = cartService.addToCart(req);

            assertThat(resp.getItems()).hasSize(1);
            assertThat(resp.getItems().get(0).getQuantity()).isEqualTo(5); // 3 + 2
        }

        @Test
        @DisplayName("lanza excepción si el producto no existe")
        void throwsWhenProductNotFound() {
            AddToCartRequest req = buildRequest(42, null, 99, 1);
            when(productRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.addToCart(req))
                .isInstanceOf(ProductoNoEncontradoException.class)
                .hasMessageContaining("99");
        }

        @Test
        @DisplayName("lanza excepción si el stock es insuficiente")
        void throwsWhenInsufficientStock() {
            productRolex.setStock(1);
            AddToCartRequest req = buildRequest(42, null, 1, 5);
            when(productRepository.findById(1)).thenReturn(Optional.of(productRolex));

            assertThatThrownBy(() -> cartService.addToCart(req))
                .isInstanceOf(StockInsuficienteException.class)
                .hasMessageContaining("Stock insuficiente");
        }

        @Test
        @DisplayName("lanza excepción si la cantidad es 0 o negativa")
        void throwsWhenQuantityIsZeroOrNegative() {
            AddToCartRequest reqZero = buildRequest(42, null, 1, 0);
            AddToCartRequest reqNeg  = buildRequest(42, null, 1, -1);

            assertThatThrownBy(() -> cartService.addToCart(reqZero))
                .isInstanceOf(CantidadInvalidaException.class);
            assertThatThrownBy(() -> cartService.addToCart(reqNeg))
                .isInstanceOf(CantidadInvalidaException.class);
        }

        @Test
        @DisplayName("crea carrito por guest token cuando no hay customerId")
        void createsGuestCartWhenNoCustomerId() {
            AddToCartRequest req = buildRequest(null, "guest-token-abc", 1, 1);

            when(productRepository.findById(1)).thenReturn(Optional.of(productRolex));
            when(cartRepository.findFirstByGuestTokenAndStatus("guest-token-abc", CartStatus.ACTIVE))
                .thenReturn(Optional.empty());
            when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> {
                Cart c = inv.getArgument(0);
                if (c.getId() == null) c.setId(2);
                return c;
            });

            CartResponse resp = cartService.addToCart(req);

            assertThat(resp.getGuestToken()).isEqualTo("guest-token-abc");
            assertThat(resp.getCustomerId()).isNull();
        }

        @Test
        @DisplayName("lanza excepción si no hay customerId ni guestToken")
        void throwsWhenNoOwnerProvided() {
            AddToCartRequest req = buildRequest(null, null, 1, 1);

            assertThatThrownBy(() -> cartService.addToCart(req))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("customerId");
        }
    }

    // ──────────────────────────────────────────────────
    // updateItemQuantity
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("updateItemQuantity")
    class UpdateItem {

        @Test
        @DisplayName("actualiza la cantidad correctamente")
        void updatesQuantity() {
            activeCart.getItems().add(CartItem.builder()
                .cart(activeCart)
                .product(productRolex)
                .quantity(2)
                .unitPrice(productRolex.getPrice())
                .build());

            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(productRepository.findById(1)).thenReturn(Optional.of(productRolex));
            when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            UpdateCartItemRequest req = new UpdateCartItemRequest();
            req.setQuantity(5);

            CartResponse resp = cartService.updateItemQuantity(1, 1, req);
            assertThat(resp.getItems().get(0).getQuantity()).isEqualTo(5);
        }

        @Test
        @DisplayName("elimina el ítem cuando la cantidad nueva es 0")
        void removesItemWhenQuantityIsZero() {
            activeCart.getItems().add(CartItem.builder()
                .cart(activeCart)
                .product(productRolex)
                .quantity(2)
                .unitPrice(productRolex.getPrice())
                .build());

            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            UpdateCartItemRequest req = new UpdateCartItemRequest();
            req.setQuantity(0);

            CartResponse resp = cartService.updateItemQuantity(1, 1, req);
            assertThat(resp.getItems()).isEmpty();
        }

        @Test
        @DisplayName("lanza excepción si el carrito no está activo")
        void throwsWhenCartNotActive() {
            activeCart.setStatus(CartStatus.CONVERTED);
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));

            UpdateCartItemRequest req = new UpdateCartItemRequest();
            req.setQuantity(3);

            assertThatThrownBy(() -> cartService.updateItemQuantity(1, 1, req))
                .isInstanceOf(CarritoInactivoException.class)
                .hasMessageContaining("activo");
        }
    }

    // ──────────────────────────────────────────────────
    // removeItem / clearCart / markAsConverted
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("removeItem / clearCart / markAsConverted")
    class RemoveAndState {

        @Test
        @DisplayName("elimina un ítem del carrito")
        void removesItem() {
            Product seiko = Product.builder()
                .id(2).sku("SEIKO-001").name("Seiko Prospex")
                .price(new BigDecimal("450.00")).stock(50).build();

            activeCart.getItems().add(CartItem.builder()
                .cart(activeCart).product(productRolex).quantity(2).unitPrice(productRolex.getPrice()).build());
            activeCart.getItems().add(CartItem.builder()
                .cart(activeCart).product(seiko).quantity(1).unitPrice(seiko.getPrice()).build());

            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            CartResponse resp = cartService.removeItem(1, 1);
            assertThat(resp.getItems()).hasSize(1);
            assertThat(resp.getItems().get(0).getProductId()).isEqualTo(2);
        }

        @Test
        @DisplayName("lanza excepción al remover ítem de carrito no activo")
        void throwsWhenRemovingFromConvertedCart() {
            activeCart.setStatus(CartStatus.CONVERTED);
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));

            assertThatThrownBy(() -> cartService.removeItem(1, 1))
                .isInstanceOf(CarritoInactivoException.class);
        }

        @Test
        @DisplayName("markAsConverted cambia el estado a CONVERTED")
        void markAsConvertedChangesStatus() {
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            cartService.markAsConverted(1);

            assertThat(activeCart.getStatus()).isEqualTo(CartStatus.CONVERTED);
        }

        @Test
        @DisplayName("getCart lanza excepción si el ID no existe")
        void throwsWhenCartNotFound() {
            when(cartRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.getCartById(999))
                .isInstanceOf(CarritoNoEncontradoException.class)
                .hasMessageContaining("999");
        }
    }

    // ──────────────────────────────────────────────────
    // toResponse — cálculo de subtotal
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("toResponse — subtotal")
    class Subtotal {

        @Test
        @DisplayName("calcula el subtotal correctamente sumando líneas")
        void calculatesSubtotalCorrectly() {
            Product seiko = Product.builder()
                .id(2).sku("SEIKO-001").name("Seiko Prospex")
                .price(new BigDecimal("450.00")).stock(50).build();

            activeCart.getItems().add(CartItem.builder()
                .cart(activeCart).product(productRolex).quantity(2).unitPrice(productRolex.getPrice()).build());
            activeCart.getItems().add(CartItem.builder()
                .cart(activeCart).product(seiko).quantity(1).unitPrice(seiko.getPrice()).build());

            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));

            CartResponse resp = cartService.getCartById(1);

            // 2 * 9500 + 1 * 450 = 19450
            assertThat(resp.getSubtotal()).isEqualByComparingTo(new BigDecimal("19450.00"));
        }

        @Test
        @DisplayName("subtotal es 0 si el carrito está vacío")
        void subtotalIsZeroForEmptyCart() {
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));

            CartResponse resp = cartService.getCartById(1);
            assertThat(resp.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    // ──────────────────────────────────────────────────
    // helpers
    // ──────────────────────────────────────────────────

    private AddToCartRequest buildRequest(Integer customerId, String guestToken,
                                          Integer productId, Integer qty) {
        AddToCartRequest r = new AddToCartRequest();
        r.setCustomerId(customerId);
        r.setGuestToken(guestToken);
        r.setProductId(productId);
        r.setQuantity(qty);
        return r;
    }
}

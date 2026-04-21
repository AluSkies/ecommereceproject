package com.uade.tpo.demo.purchaseservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.dto.cart.AddToCartRequest;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.UpdateCartItemRequest;
import com.uade.tpo.demo.purchaseservice.exception.CantidadInvalidaException;
import com.uade.tpo.demo.purchaseservice.exception.CarritoNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("CartController — endpoints REST")
class CartControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean CartService cartService;

    private CartResponse sampleCart;

    @BeforeEach
    void setUp() {
        CartItemResponse item = CartItemResponse.builder()
            .productId(1).productName("Rolex Submariner").productSku("ROLEX-001")
            .unitPrice(new BigDecimal("9500.00")).quantity(2)
            .lineTotal(new BigDecimal("19000.00")).build();

        sampleCart = CartResponse.builder()
            .id(1).customerId(42).status(CartStatus.ACTIVE)
            .items(List.of(item))
            .subtotal(new BigDecimal("19000.00"))
            .expiresAt(LocalDateTime.now().plusDays(7))
            .updatedAt(LocalDateTime.now())
            .build();
    }

    // ──────────────────────────────────────────────────
    // POST /api/v1/cart/items
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/cart/items")
    class AddItem {

        @Test
        @DisplayName("201 Created con carrito actualizado")
        void returns201WithCart() throws Exception {
            when(cartService.addToCart(any())).thenReturn(sampleCart);

            AddToCartRequest req = new AddToCartRequest();
            req.setCustomerId(42);
            req.setProductId(1);
            req.setQuantity(2);

            mockMvc.perform(post("/api/v1/cart/items")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.customerId").value(42))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.items[0].productName").value("Rolex Submariner"))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.subtotal").value(19000.00));
        }

        @Test
        @DisplayName("400 cuando el servicio lanza CantidadInvalidaException")
        void returns400WhenServiceThrows() throws Exception {
            when(cartService.addToCart(any())).thenThrow(new CantidadInvalidaException(100));

            AddToCartRequest req = new AddToCartRequest();
            req.setCustomerId(42);
            req.setProductId(1);
            req.setQuantity(100);

            mockMvc.perform(post("/api/v1/cart/items")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/cart/{cartId}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/cart/{cartId}")
    class GetCart {

        @Test
        @DisplayName("200 OK con el carrito")
        void returns200WithCart() throws Exception {
            when(cartService.getCartById(1)).thenReturn(sampleCart);

            mockMvc.perform(get("/api/v1/cart/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(1));
        }

        @Test
        @DisplayName("404 cuando el carrito no existe")
        void returns404WhenNotFound() throws Exception {
            when(cartService.getCartById(999)).thenThrow(new CarritoNoEncontradoException(999));

            mockMvc.perform(get("/api/v1/cart/999"))
                .andExpect(status().isNotFound());
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/cart/customer/{customerId}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/cart/customer/{customerId}")
    class GetCartByCustomer {

        @Test
        @DisplayName("200 OK con el carrito activo del cliente")
        void returns200() throws Exception {
            when(cartService.getCartByCustomerId(42)).thenReturn(sampleCart);

            mockMvc.perform(get("/api/v1/cart/customer/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(42));
        }

        @Test
        @DisplayName("404 si el cliente no tiene carrito activo")
        void returns404WhenNoActiveCart() throws Exception {
            when(cartService.getCartByCustomerId(99)).thenThrow(
                new CarritoNoEncontradoException("cliente", "99"));

            mockMvc.perform(get("/api/v1/cart/customer/99"))
                .andExpect(status().isNotFound());
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/cart/guest/{guestToken}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/cart/guest/{guestToken}")
    class GetCartByGuest {

        @Test
        @DisplayName("200 OK con el carrito del invitado")
        void returns200() throws Exception {
            CartResponse guestCart = CartResponse.builder()
                .id(2).guestToken("abc-token").status(CartStatus.ACTIVE)
                .items(List.of()).subtotal(BigDecimal.ZERO)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .updatedAt(LocalDateTime.now()).build();

            when(cartService.getCartByGuestToken("abc-token")).thenReturn(guestCart);

            mockMvc.perform(get("/api/v1/cart/guest/abc-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guestToken").value("abc-token"));
        }
    }

    // ──────────────────────────────────────────────────
    // PUT /api/v1/cart/{cartId}/items/{productId}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /api/v1/cart/{cartId}/items/{productId}")
    class UpdateItem {

        @Test
        @DisplayName("200 OK al actualizar cantidad")
        void returns200OnUpdate() throws Exception {
            when(cartService.updateItemQuantity(eq(1), eq(1), any())).thenReturn(sampleCart);

            UpdateCartItemRequest req = new UpdateCartItemRequest();
            req.setQuantity(5);

            mockMvc.perform(put("/api/v1/cart/1/items/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("400 cuando cantidad es inválida")
        void returns400WhenInvalid() throws Exception {
            when(cartService.updateItemQuantity(eq(1), eq(1), any()))
                .thenThrow(new CantidadInvalidaException("Cantidad requerida"));

            UpdateCartItemRequest req = new UpdateCartItemRequest();
            req.setQuantity(3);

            mockMvc.perform(put("/api/v1/cart/1/items/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
        }
    }

    // ──────────────────────────────────────────────────
    // DELETE /api/v1/cart/{cartId}/items/{productId}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /api/v1/cart/{cartId}/items/{productId}")
    class RemoveItem {

        @Test
        @DisplayName("200 OK al eliminar ítem")
        void returns200OnRemove() throws Exception {
            CartResponse emptyCart = CartResponse.builder()
                .id(1).customerId(42).status(CartStatus.ACTIVE)
                .items(List.of()).subtotal(BigDecimal.ZERO)
                .expiresAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

            when(cartService.removeItem(1, 1)).thenReturn(emptyCart);

            mockMvc.perform(delete("/api/v1/cart/1/items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
        }
    }

    // ──────────────────────────────────────────────────
    // DELETE /api/v1/cart/{cartId}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /api/v1/cart/{cartId}")
    class ClearCart {

        @Test
        @DisplayName("204 No Content al vaciar el carrito")
        void returns204OnClear() throws Exception {
            doNothing().when(cartService).clearCart(1);

            mockMvc.perform(delete("/api/v1/cart/1"))
                .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("404 si el carrito no existe")
        void returns404WhenNotFound() throws Exception {
            doThrow(new CarritoNoEncontradoException(999)).when(cartService).clearCart(999);

            mockMvc.perform(delete("/api/v1/cart/999"))
                .andExpect(status().isNotFound());
        }
    }
}

package com.uade.tpo.demo.purchaseservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import com.uade.tpo.demo.purchaseservice.dto.order.CheckoutRequest;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderStatusHistoryResponse;
import com.uade.tpo.demo.purchaseservice.service.OrderService;
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
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("OrderController — endpoints REST")
class OrderControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean OrderService orderService;

    private OrderResponse sampleOrder;

    @BeforeEach
    void setUp() {
        OrderItemResponse item = OrderItemResponse.builder()
            .productId(1).productName("Rolex Submariner").productSku("ROLEX-001")
            .unitPrice(new BigDecimal("9500.00")).quantity(1)
            .subtotal(new BigDecimal("9500.00")).build();

        OrderStatusHistoryResponse histEntry = OrderStatusHistoryResponse.builder()
            .previousStatus(null).newStatus(OrderStatus.PENDING)
            .note("Orden creada").changedAt(LocalDateTime.now()).build();

        sampleOrder = OrderResponse.builder()
            .id(1).orderNumber("ORD-20260420-1000")
            .customerId(42).status(OrderStatus.PENDING)
            .items(List.of(item))
            .subtotal(new BigDecimal("9500.00"))
            .discountTotal(BigDecimal.ZERO)
            .shippingTotal(new BigDecimal("15.00"))
            .taxTotal(new BigDecimal("1995.00"))
            .grandTotal(new BigDecimal("11510.00"))
            .currency("ARS")
            .shippingSnapshot("{\"firstName\":\"Juan\",\"city\":\"Buenos Aires\"}")
            .placedAt(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .statusHistory(List.of(histEntry))
            .build();
    }

    // ──────────────────────────────────────────────────
    // POST /api/v1/orders/checkout
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/orders/checkout")
    class Checkout {

        @Test
        @DisplayName("201 Created con la orden generada")
        void returns201OnCheckout() throws Exception {
            when(orderService.checkout(any())).thenReturn(sampleOrder);

            CheckoutRequest req = new CheckoutRequest();
            req.setCartId(1);
            req.setCustomerId(42);
            req.setFirstName("Juan");
            req.setLastName("Pérez");
            req.setLine1("Av. Corrientes 1234");
            req.setCity("Buenos Aires");
            req.setCountryCode("AR");

            mockMvc.perform(post("/api/v1/orders/checkout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderNumber").value("ORD-20260420-1000"))
                .andExpect(jsonPath("$.customerId").value(42))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.currency").value("ARS"))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.subtotal").value(9500.00))
                .andExpect(jsonPath("$.grandTotal").value(11510.00));
        }

        @Test
        @DisplayName("400 si el carrito no está activo")
        void returns400WhenCartNotActive() throws Exception {
            when(orderService.checkout(any()))
                .thenThrow(new IllegalStateException("El carrito no está activo"));

            CheckoutRequest req = new CheckoutRequest();
            req.setCartId(99);
            req.setCustomerId(42);
            req.setCountryCode("AR");

            mockMvc.perform(post("/api/v1/orders/checkout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("400 si el carrito está vacío")
        void returns400WhenCartIsEmpty() throws Exception {
            when(orderService.checkout(any()))
                .thenThrow(new IllegalStateException("El carrito está vacío"));

            CheckoutRequest req = new CheckoutRequest();
            req.setCartId(1);
            req.setCustomerId(42);
            req.setCountryCode("AR");

            mockMvc.perform(post("/api/v1/orders/checkout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("201 con descuento aplicado cuando el código es válido")
        void returns201WithDiscountApplied() throws Exception {
            OrderResponse discountedOrder = OrderResponse.builder()
                .id(2).orderNumber("ORD-20260420-1001")
                .customerId(42).status(OrderStatus.PENDING)
                .items(List.of())
                .subtotal(new BigDecimal("10400.00"))
                .discountTotal(new BigDecimal("1040.00"))
                .shippingTotal(new BigDecimal("15.00"))
                .taxTotal(new BigDecimal("1965.60"))
                .grandTotal(new BigDecimal("11340.60"))
                .currency("ARS")
                .shippingSnapshot("{}")
                .placedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .statusHistory(List.of())
                .build();

            when(orderService.checkout(any())).thenReturn(discountedOrder);

            CheckoutRequest req = new CheckoutRequest();
            req.setCartId(1);
            req.setCustomerId(42);
            req.setDiscountCode("RELOJES10");
            req.setCountryCode("AR");

            mockMvc.perform(post("/api/v1/orders/checkout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.discountTotal").value(1040.00));
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/orders/{id}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/orders/{id}")
    class GetOrder {

        @Test
        @DisplayName("200 con la orden encontrada")
        void returns200WithOrder() throws Exception {
            when(orderService.getOrder(1)).thenReturn(sampleOrder);

            mockMvc.perform(get("/api/v1/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderNumber").value("ORD-20260420-1000"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.statusHistory").isArray())
                .andExpect(jsonPath("$.statusHistory.length()").value(1));
        }

        @Test
        @DisplayName("404 si la orden no existe")
        void returns404WhenNotFound() throws Exception {
            when(orderService.getOrder(999))
                .thenThrow(new IllegalArgumentException("Orden no encontrada: 999"));

            mockMvc.perform(get("/api/v1/orders/999"))
                .andExpect(status().isNotFound());
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/orders/number/{orderNumber}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/orders/number/{orderNumber}")
    class GetOrderByNumber {

        @Test
        @DisplayName("200 con la orden encontrada por número")
        void returns200WithOrder() throws Exception {
            when(orderService.getOrderByNumber("ORD-20260420-1000")).thenReturn(sampleOrder);

            mockMvc.perform(get("/api/v1/orders/number/ORD-20260420-1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-20260420-1000"))
                .andExpect(jsonPath("$.customerId").value(42));
        }

        @Test
        @DisplayName("404 si el número de orden no existe")
        void returns404WhenNotFound() throws Exception {
            when(orderService.getOrderByNumber("ORD-INVALID"))
                .thenThrow(new IllegalArgumentException("Orden no encontrada"));

            mockMvc.perform(get("/api/v1/orders/number/ORD-INVALID"))
                .andExpect(status().isNotFound());
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/orders/customer/{customerId}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/orders/customer/{customerId}")
    class GetOrdersByCustomer {

        @Test
        @DisplayName("200 con lista de órdenes del cliente")
        void returns200WithCustomerOrders() throws Exception {
            when(orderService.getOrdersByCustomer(42)).thenReturn(List.of(sampleOrder));

            mockMvc.perform(get("/api/v1/orders/customer/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customerId").value(42))
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-20260420-1000"));
        }

        @Test
        @DisplayName("200 con lista vacía si el cliente no tiene órdenes")
        void returns200WithEmptyListWhenNoOrders() throws Exception {
            when(orderService.getOrdersByCustomer(99)).thenReturn(List.of());

            mockMvc.perform(get("/api/v1/orders/customer/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/orders
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/orders")
    class GetAllOrders {

        @Test
        @DisplayName("200 con todas las órdenes")
        void returns200WithAllOrders() throws Exception {
            when(orderService.getAllOrders()).thenReturn(List.of(sampleOrder));

            mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1));
        }

        @Test
        @DisplayName("200 con lista vacía si no hay órdenes")
        void returns200WithEmptyList() throws Exception {
            when(orderService.getAllOrders()).thenReturn(List.of());

            mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        }
    }

    // ──────────────────────────────────────────────────
    // PATCH /api/v1/orders/{id}/status
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("PATCH /api/v1/orders/{id}/status")
    class UpdateStatus {

        @Test
        @DisplayName("200 con el estado actualizado a CONFIRMED")
        void returns200OnValidTransition() throws Exception {
            OrderResponse confirmed = OrderResponse.builder()
                .id(1).orderNumber("ORD-20260420-1000")
                .customerId(42).status(OrderStatus.CONFIRMED)
                .items(List.of()).subtotal(new BigDecimal("9500.00"))
                .discountTotal(BigDecimal.ZERO)
                .shippingTotal(new BigDecimal("15.00"))
                .taxTotal(new BigDecimal("1995.00"))
                .grandTotal(new BigDecimal("11510.00"))
                .currency("ARS").shippingSnapshot("{}")
                .placedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .statusHistory(List.of()).build();

            when(orderService.updateStatus(eq(1), eq(OrderStatus.CONFIRMED), anyString(), any()))
                .thenReturn(confirmed);

            Map<String, Object> body = Map.of(
                "status", "CONFIRMED",
                "note", "Pago verificado",
                "changedBy", 99
            );

            mockMvc.perform(patch("/api/v1/orders/1/status")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
        }

        @Test
        @DisplayName("400 en transición inválida (DELIVERED → CONFIRMED)")
        void returns400OnInvalidTransition() throws Exception {
            when(orderService.updateStatus(eq(1), eq(OrderStatus.CONFIRMED), anyString(), any()))
                .thenThrow(new IllegalStateException("Transición inválida"));

            Map<String, Object> body = Map.of("status", "CONFIRMED", "note", "");

            mockMvc.perform(patch("/api/v1/orders/1/status")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("400 con un valor de status desconocido")
        void returns400OnUnknownStatus() throws Exception {
            Map<String, Object> body = Map.of("status", "INVALID_STATUS");

            mockMvc.perform(patch("/api/v1/orders/1/status")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
        }
    }

    // ──────────────────────────────────────────────────
    // PATCH /api/v1/orders/{id}/cancel
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("PATCH /api/v1/orders/{id}/cancel")
    class CancelOrder {

        @Test
        @DisplayName("200 al cancelar una orden PENDING")
        void returns200OnCancelPending() throws Exception {
            OrderResponse cancelled = OrderResponse.builder()
                .id(1).orderNumber("ORD-20260420-1000")
                .customerId(42).status(OrderStatus.CANCELLED)
                .items(List.of()).subtotal(new BigDecimal("9500.00"))
                .discountTotal(BigDecimal.ZERO)
                .shippingTotal(new BigDecimal("15.00"))
                .taxTotal(new BigDecimal("1995.00"))
                .grandTotal(new BigDecimal("11510.00"))
                .currency("ARS").shippingSnapshot("{}")
                .placedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .statusHistory(List.of()).build();

            when(orderService.cancelOrder(eq(1), anyString(), any())).thenReturn(cancelled);

            Map<String, Object> body = Map.of(
                "reason", "Cliente solicitó cancelación",
                "changedBy", 42
            );

            mockMvc.perform(patch("/api/v1/orders/1/cancel")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
        }

        @Test
        @DisplayName("400 al intentar cancelar una orden ya enviada")
        void returns400WhenCancellingShippedOrder() throws Exception {
            when(orderService.cancelOrder(eq(1), anyString(), any()))
                .thenThrow(new IllegalStateException("No se puede cancelar una orden ya enviada"));

            Map<String, Object> body = Map.of("reason", "tarde");

            mockMvc.perform(patch("/api/v1/orders/1/cancel")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("400 al intentar cancelar una orden ya entregada")
        void returns400WhenCancellingDeliveredOrder() throws Exception {
            when(orderService.cancelOrder(eq(2), anyString(), any()))
                .thenThrow(new IllegalStateException("No se puede cancelar una orden ya entregada"));

            Map<String, Object> body = Map.of("reason", "demasiado tarde");

            mockMvc.perform(patch("/api/v1/orders/2/cancel")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
        }
    }
}

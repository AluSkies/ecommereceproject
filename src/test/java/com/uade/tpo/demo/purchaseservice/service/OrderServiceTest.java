package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.CheckoutRequest;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderResponse;
import com.uade.tpo.demo.purchaseservice.entity.Discount;
import com.uade.tpo.demo.purchaseservice.entity.Order;
import com.uade.tpo.demo.purchaseservice.repository.OrderRepository;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService")
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartService cartService;
    @Mock DiscountService discountService;
    @InjectMocks OrderService orderService;

    private CartResponse activeCart;
    private Order pendingOrder;

    @BeforeEach
    void setUp() {
        CartItemResponse item1 = CartItemResponse.builder()
            .productId(1).productName("Rolex Submariner").productSku("ROLEX-001")
            .unitPrice(new BigDecimal("9500.00")).quantity(1)
            .lineTotal(new BigDecimal("9500.00")).build();

        CartItemResponse item2 = CartItemResponse.builder()
            .productId(2).productName("Seiko Prospex").productSku("SEIKO-001")
            .unitPrice(new BigDecimal("450.00")).quantity(2)
            .lineTotal(new BigDecimal("900.00")).build();

        activeCart = CartResponse.builder()
            .id(1).customerId(42).status(CartStatus.ACTIVE)
            .items(List.of(item1, item2))
            .subtotal(new BigDecimal("10400.00"))
            .expiresAt(LocalDateTime.now().plusDays(7))
            .updatedAt(LocalDateTime.now())
            .build();

        pendingOrder = Order.builder()
            .id(1).orderNumber("ORD-20260420-1000")
            .customerId(42).status(OrderStatus.PENDING)
            .subtotal(new BigDecimal("10400.00"))
            .discountTotal(BigDecimal.ZERO)
            .shippingTotal(new BigDecimal("15.00"))
            .taxTotal(new BigDecimal("2184.00"))
            .grandTotal(new BigDecimal("12599.00"))
            .currency("ARS")
            .shippingSnapshot("{}")
            .placedAt(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .items(new ArrayList<>())
            .statusHistory(new ArrayList<>())
            .build();
    }

    // ──────────────────────────────────────────────────
    // checkout
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("checkout")
    class Checkout {

        @Test
        @DisplayName("crea la orden correctamente desde un carrito activo sin descuento")
        void createsOrderFromActiveCart() {
            when(cartService.getCart(1)).thenReturn(activeCart);
            when(orderRepository.save(any())).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1);
                return o;
            });
            doNothing().when(cartService).markAsConverted(1);

            CheckoutRequest req = buildCheckout(1, 42, null);
            OrderResponse resp = orderService.checkout(req);

            assertThat(resp.getCustomerId()).isEqualTo(42);
            assertThat(resp.getStatus()).isEqualTo(OrderStatus.PENDING);
            assertThat(resp.getItems()).hasSize(2);
            assertThat(resp.getSubtotal()).isEqualByComparingTo(new BigDecimal("10400.00"));
            assertThat(resp.getDiscountTotal()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(resp.getShippingTotal()).isEqualByComparingTo(new BigDecimal("15.00"));
            assertThat(resp.getCurrency()).isEqualTo("ARS");
            assertThat(resp.getOrderNumber()).startsWith("ORD-");
            assertThat(resp.getStatusHistory()).hasSize(1); // entrada inicial
            verify(cartService).markAsConverted(1);
        }

        @Test
        @DisplayName("aplica descuento cuando se provee un código válido")
        void appliesDiscountWhenValidCodeProvided() {
            Discount d = Discount.builder()
                .id(1).code("RELOJES10").name("10%")
                .percentage(new BigDecimal("10.00"))
                .startsAt(LocalDateTime.now().minusDays(1))
                .endsAt(LocalDateTime.now().plusDays(30))
                .isActive(true).build();

            when(cartService.getCart(1)).thenReturn(activeCart);
            when(discountService.findValidByCode("RELOJES10")).thenReturn(Optional.of(d));
            when(orderRepository.save(any())).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1);
                return o;
            });
            doNothing().when(cartService).markAsConverted(1);

            CheckoutRequest req = buildCheckout(1, 42, "RELOJES10");
            OrderResponse resp = orderService.checkout(req);

            // subtotal 10400, 10% = 1040 descuento
            assertThat(resp.getDiscountTotal()).isEqualByComparingTo(new BigDecimal("1040.00"));
            // (10400 - 1040) = 9360 base + 21% IVA + envío
            BigDecimal expectedAfterDiscount = new BigDecimal("9360.00");
            BigDecimal expectedTax = expectedAfterDiscount.multiply(new BigDecimal("0.21"))
                .setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal expectedGrand = expectedAfterDiscount.add(expectedTax).add(new BigDecimal("15.00"));
            assertThat(resp.getGrandTotal()).isEqualByComparingTo(expectedGrand);
        }

        @Test
        @DisplayName("ignora el código de descuento si no es válido y continua el checkout")
        void ignoresInvalidDiscountCode() {
            when(cartService.getCart(1)).thenReturn(activeCart);
            when(discountService.findValidByCode("EXPIRED")).thenReturn(Optional.empty());
            when(orderRepository.save(any())).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1);
                return o;
            });
            doNothing().when(cartService).markAsConverted(1);

            CheckoutRequest req = buildCheckout(1, 42, "EXPIRED");
            OrderResponse resp = orderService.checkout(req);

            assertThat(resp.getDiscountTotal()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("lanza excepción si el carrito no está activo")
        void throwsWhenCartNotActive() {
            CartResponse convertedCart = CartResponse.builder()
                .id(1).customerId(42).status(CartStatus.CONVERTED)
                .items(List.of()).subtotal(BigDecimal.ZERO)
                .expiresAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

            when(cartService.getCart(1)).thenReturn(convertedCart);

            assertThatThrownBy(() -> orderService.checkout(buildCheckout(1, 42, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("activo");
        }

        @Test
        @DisplayName("lanza excepción si el carrito está vacío")
        void throwsWhenCartIsEmpty() {
            CartResponse emptyCart = CartResponse.builder()
                .id(1).customerId(42).status(CartStatus.ACTIVE)
                .items(new ArrayList<>()).subtotal(BigDecimal.ZERO)
                .expiresAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

            when(cartService.getCart(1)).thenReturn(emptyCart);

            assertThatThrownBy(() -> orderService.checkout(buildCheckout(1, 42, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("vacío");
        }

        @Test
        @DisplayName("el shipping_snapshot captura los datos de envío")
        void capturesShippingSnapshot() {
            when(cartService.getCart(1)).thenReturn(activeCart);
            when(orderRepository.save(any())).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1);
                return o;
            });
            doNothing().when(cartService).markAsConverted(1);

            CheckoutRequest req = buildCheckout(1, 42, null);
            req.setFirstName("Juan");
            req.setLastName("Pérez");
            req.setCity("Buenos Aires");

            OrderResponse resp = orderService.checkout(req);

            assertThat(resp.getShippingSnapshot()).contains("Juan");
            assertThat(resp.getShippingSnapshot()).contains("Pérez");
            assertThat(resp.getShippingSnapshot()).contains("Buenos Aires");
        }
    }

    // ──────────────────────────────────────────────────
    // updateStatus — máquina de estados
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("updateStatus — máquina de estados")
    class StatusMachine {

        @Test
        @DisplayName("PENDING → CONFIRMED es una transición válida")
        void pendingToConfirmedIsValid() {
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            OrderResponse resp = orderService.updateStatus(1, OrderStatus.CONFIRMED, "Pago verificado", 99);

            assertThat(resp.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
            assertThat(resp.getStatusHistory()).hasSize(1);
            assertThat(resp.getStatusHistory().get(0).getPreviousStatus()).isEqualTo(OrderStatus.PENDING);
            assertThat(resp.getStatusHistory().get(0).getNewStatus()).isEqualTo(OrderStatus.CONFIRMED);
            assertThat(resp.getStatusHistory().get(0).getNote()).isEqualTo("Pago verificado");
        }

        @Test
        @DisplayName("CONFIRMED → PROCESSING → SHIPPED → DELIVERED es el flujo feliz")
        void happyPathTransitions() {
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            orderService.updateStatus(1, OrderStatus.CONFIRMED, "", null);
            orderService.updateStatus(1, OrderStatus.PROCESSING, "", null);
            orderService.updateStatus(1, OrderStatus.SHIPPED, "", null);

            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));
            OrderResponse resp = orderService.updateStatus(1, OrderStatus.DELIVERED, "Entregado", null);

            assertThat(resp.getStatus()).isEqualTo(OrderStatus.DELIVERED);
        }

        @Test
        @DisplayName("lanza excepción en transición inválida (DELIVERED → CONFIRMED)")
        void throwsOnInvalidTransition() {
            pendingOrder.setStatus(OrderStatus.DELIVERED);
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.updateStatus(1, OrderStatus.CONFIRMED, "", null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("inválida");
        }

        @Test
        @DisplayName("lanza excepción en transición inválida (CANCELLED → PROCESSING)")
        void throwsWhenTryingToReactivateCancelledOrder() {
            pendingOrder.setStatus(OrderStatus.CANCELLED);
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.updateStatus(1, OrderStatus.PROCESSING, "", null))
                .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("cancelOrder cancela correctamente una orden PENDING")
        void cancelsPendingOrder() {
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            OrderResponse resp = orderService.cancelOrder(1, "Cliente solicitó cancelación", 42);

            assertThat(resp.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        }

        @Test
        @DisplayName("cancelOrder cancela correctamente una orden CONFIRMED")
        void cancelsConfirmedOrder() {
            pendingOrder.setStatus(OrderStatus.CONFIRMED);
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            OrderResponse resp = orderService.cancelOrder(1, "Arrepentimiento", 42);

            assertThat(resp.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        }

        @Test
        @DisplayName("cancelOrder lanza excepción si la orden ya fue enviada")
        void throwsWhenCancellingShippedOrder() {
            pendingOrder.setStatus(OrderStatus.SHIPPED);
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.cancelOrder(1, "tarde", 42))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("enviada");
        }

        @Test
        @DisplayName("cancelOrder lanza excepción si la orden ya fue entregada")
        void throwsWhenCancellingDeliveredOrder() {
            pendingOrder.setStatus(OrderStatus.DELIVERED);
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.cancelOrder(1, "tarde", 42))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    // ──────────────────────────────────────────────────
    // getOrder / getOrdersByCustomer
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("getOrder")
    class GetOrder {

        @Test
        @DisplayName("devuelve la orden por ID")
        void returnsOrderById() {
            when(orderRepository.findById(1)).thenReturn(Optional.of(pendingOrder));

            OrderResponse resp = orderService.getOrder(1);
            assertThat(resp.getId()).isEqualTo(1);
            assertThat(resp.getOrderNumber()).isEqualTo("ORD-20260420-1000");
        }

        @Test
        @DisplayName("lanza excepción si la orden no existe")
        void throwsWhenOrderNotFound() {
            when(orderRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.getOrder(999))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("999");
        }

        @Test
        @DisplayName("devuelve las órdenes de un cliente")
        void returnsOrdersByCustomer() {
            when(orderRepository.findByCustomerId(42)).thenReturn(List.of(pendingOrder));

            List<OrderResponse> result = orderService.getOrdersByCustomer(42);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCustomerId()).isEqualTo(42);
        }
    }

    private CheckoutRequest buildCheckout(Integer cartId, Integer customerId, String discountCode) {
        CheckoutRequest r = new CheckoutRequest();
        r.setCartId(cartId);
        r.setCustomerId(customerId);
        r.setDiscountCode(discountCode);
        r.setFirstName("Test");
        r.setLastName("User");
        r.setLine1("Av. Corrientes 1234");
        r.setCity("Buenos Aires");
        r.setCountryCode("AR");
        return r;
    }
}

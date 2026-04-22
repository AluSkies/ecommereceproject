package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.domain.DiscountType;
import com.uade.tpo.demo.catalogservice.discount.entity.Discount;
import com.uade.tpo.demo.catalogservice.discount.service.DiscountService;
import com.uade.tpo.demo.catalogservice.entity.Product;
import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import com.uade.tpo.demo.purchaseservice.dto.order.CheckoutRequest;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderResponse;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import com.uade.tpo.demo.purchaseservice.entity.CartItem;
import com.uade.tpo.demo.purchaseservice.entity.Order;
import com.uade.tpo.demo.purchaseservice.entity.OrderItem;
import com.uade.tpo.demo.purchaseservice.entity.OrderStatusHistory;
import com.uade.tpo.demo.purchaseservice.repository.CartRepository;
import com.uade.tpo.demo.purchaseservice.repository.OrderRepository;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService")
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartRepository cartRepository;
    @Mock ProductRepository productRepository;
    @Mock DiscountService discountService;
    @InjectMocks OrderService orderService;

    private Product rolex;
    private Product seiko;
    private Cart activeCart;
    private Order pendingOrder;

    @BeforeEach
    void setup() {
        rolex = Product.builder()
            .id(1).sku("ROLEX-001").name("Rolex Submariner")
            .price(new BigDecimal("9500.00")).stock(10).build();
        seiko = Product.builder()
            .id(2).sku("SEIKO-001").name("Seiko Prospex")
            .price(new BigDecimal("450.00")).stock(20).build();

        CartItem item1 = CartItem.builder()
            .id(1).product(rolex).quantity(1).unitPrice(new BigDecimal("9500.00")).build();
        CartItem item2 = CartItem.builder()
            .id(2).product(seiko).quantity(2).unitPrice(new BigDecimal("450.00")).build();

        activeCart = Cart.builder()
            .id(1).userId(42L).status(CartStatus.ACTIVE)
            .items(new ArrayList<>(List.of(item1, item2)))
            .expiresAt(LocalDateTime.now().plusDays(7))
            .build();

        pendingOrder = Order.builder()
            .id(1L).orderNumber("ORD-20260420-1000")
            .userId(42L).status(OrderStatus.PENDING)
            .subtotal(new BigDecimal("10400.00"))
            .discountTotal(BigDecimal.ZERO)
            .shippingTotal(new BigDecimal("15.00"))
            .taxTotal(new BigDecimal("2184.00"))
            .grandTotal(new BigDecimal("12599.00"))
            .currency("ARS")
            .shippingSnapshot("{}")
            .placedAt(LocalDateTime.now())
            .items(new ArrayList<>())
            .statusHistory(new ArrayList<>())
            .build();
    }

    @Nested
    @DisplayName("checkout")
    class Checkout {

        @Test
        @DisplayName("crea la orden correctamente desde un carrito activo sin descuento")
        void createsOrderFromActiveCart() {
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1L);
                return o;
            });
            when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

            CheckoutRequest req = buildCheckout(1, 42, null);
            OrderResponse resp = orderService.checkout(req);

            assertThat(resp.getUserId()).isEqualTo(42L);
            assertThat(resp.getStatus()).isEqualTo(OrderStatus.PENDING);
            assertThat(resp.getItems()).hasSize(2);
            assertThat(resp.getSubtotal()).isEqualByComparingTo(new BigDecimal("10400.00"));
            assertThat(resp.getDiscountTotal()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(resp.getShippingTotal()).isEqualByComparingTo(new BigDecimal("15.00"));
            assertThat(resp.getCurrency()).isEqualTo("ARS");
            assertThat(resp.getOrderNumber()).startsWith("ORD-");
            assertThat(resp.getStatusHistory()).hasSize(1);
            verify(cartRepository).save(argThat(c -> c.getStatus() == CartStatus.CONVERTED));
        }

        @Test
        @DisplayName("aplica descuento cuando se provee un código válido")
        void appliesDiscountWhenValidCodeProvided() {
            Discount d = Discount.builder()
                .id(1).code("RELOJES10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .status(DiscountStatus.ACTIVE)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .usesCount(0).build();

            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(discountService.findValidByCode("RELOJES10")).thenReturn(Optional.of(d));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1L);
                return o;
            });
            when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

            CheckoutRequest req = buildCheckout(1, 42, "RELOJES10");
            OrderResponse resp = orderService.checkout(req);

            assertThat(resp.getDiscountTotal()).isEqualByComparingTo(new BigDecimal("1040.00"));
            BigDecimal expectedAfterDiscount = new BigDecimal("9360.00");
            BigDecimal expectedTax = expectedAfterDiscount.multiply(new BigDecimal("0.21"))
                .setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal expectedGrand = expectedAfterDiscount.add(expectedTax).add(new BigDecimal("15.00"));
            assertThat(resp.getGrandTotal()).isEqualByComparingTo(expectedGrand);
        }

        @Test
        @DisplayName("ignora el código de descuento si no es válido y continua el checkout")
        void ignoresInvalidDiscountCode() {
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(discountService.findValidByCode("EXPIRED")).thenReturn(Optional.empty());
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1L);
                return o;
            });
            when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

            CheckoutRequest req = buildCheckout(1, 42, "EXPIRED");
            OrderResponse resp = orderService.checkout(req);

            assertThat(resp.getDiscountTotal()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("lanza excepción si el carrito no está activo")
        void throwsWhenCartNotActive() {
            activeCart.setStatus(CartStatus.CONVERTED);
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));

            assertThatThrownBy(() -> orderService.checkout(buildCheckout(1, 42, null)))
                .isInstanceOf(com.uade.tpo.demo.purchaseservice.exception.CarritoInactivoException.class);
        }

        @Test
        @DisplayName("lanza excepción si el carrito está vacío")
        void throwsWhenCartIsEmpty() {
            activeCart.setItems(new ArrayList<>());
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));

            assertThatThrownBy(() -> orderService.checkout(buildCheckout(1, 42, null)))
                .isInstanceOf(com.uade.tpo.demo.purchaseservice.exception.SolicitudInvalidaException.class)
                .hasMessageContaining("vacío");
        }

        @Test
        @DisplayName("el shipping_snapshot captura los datos de envío")
        void capturesShippingSnapshot() {
            when(cartRepository.findById(1)).thenReturn(Optional.of(activeCart));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order o = inv.getArgument(0);
                o.setId(1L);
                return o;
            });
            when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

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

    @Nested
    @DisplayName("updateStatus — máquina de estados")
    class StatusMachine {

        @Test
        @DisplayName("PENDING → CONFIRMED es una transición válida")
        void pendingToConfirmedIsValid() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            OrderResponse resp = orderService.updateStatus(1L, OrderStatus.CONFIRMED, "Pago verificado", 99L);

            assertThat(resp.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
            assertThat(resp.getStatusHistory()).hasSize(1);
            assertThat(resp.getStatusHistory().get(0).getPreviousStatus()).isEqualTo(OrderStatus.PENDING);
            assertThat(resp.getStatusHistory().get(0).getNewStatus()).isEqualTo(OrderStatus.CONFIRMED);
            assertThat(resp.getStatusHistory().get(0).getNote()).isEqualTo("Pago verificado");
        }

        @Test
        @DisplayName("lanza excepción en transición inválida (DELIVERED → CONFIRMED)")
        void throwsOnInvalidTransition() {
            pendingOrder.setStatus(OrderStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.updateStatus(1L, OrderStatus.CONFIRMED, "", null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("inválida");
        }

        @Test
        @DisplayName("lanza excepción en transición inválida (CANCELLED → PROCESSING)")
        void throwsWhenTryingToReactivateCancelledOrder() {
            pendingOrder.setStatus(OrderStatus.CANCELLED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.updateStatus(1L, OrderStatus.PROCESSING, "", null))
                .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("cancelOrder cancela correctamente una orden PENDING")
        void cancelsPendingOrder() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            OrderResponse resp = orderService.cancelOrder(1L, "Cliente solicitó cancelación", 42L);

            assertThat(resp.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        }

        @Test
        @DisplayName("cancelOrder lanza excepción si la orden ya fue enviada")
        void throwsWhenCancellingShippedOrder() {
            pendingOrder.setStatus(OrderStatus.SHIPPED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.cancelOrder(1L, "tarde", 42L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("enviada");
        }

        @Test
        @DisplayName("cancelOrder lanza excepción si la orden ya fue entregada")
        void throwsWhenCancellingDeliveredOrder() {
            pendingOrder.setStatus(OrderStatus.DELIVERED);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.cancelOrder(1L, "tarde", 42L))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("getOrder")
    class GetOrder {

        @Test
        @DisplayName("devuelve la orden por ID")
        void returnsOrderById() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(pendingOrder));

            OrderResponse resp = orderService.getOrder(1L);
            assertThat(resp.getId()).isEqualTo(1L);
            assertThat(resp.getOrderNumber()).isEqualTo("ORD-20260420-1000");
        }

        @Test
        @DisplayName("lanza excepción si la orden no existe")
        void throwsWhenOrderNotFound() {
            when(orderRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.getOrder(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("999");
        }

        @Test
        @DisplayName("devuelve las órdenes de un cliente")
        void returnsOrdersByCustomer() {
            when(orderRepository.findByUserId(42L)).thenReturn(List.of(pendingOrder));

            List<OrderResponse> result = orderService.getOrdersByCustomer(42L);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getUserId()).isEqualTo(42L);
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

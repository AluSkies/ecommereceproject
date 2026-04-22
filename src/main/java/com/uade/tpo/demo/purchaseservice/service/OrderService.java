package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import com.uade.tpo.demo.purchaseservice.dto.cart.CartResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.CheckoutRequest;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderStatusHistoryResponse;
import com.uade.tpo.demo.purchaseservice.entity.Discount;
import com.uade.tpo.demo.purchaseservice.entity.Order;
import com.uade.tpo.demo.purchaseservice.entity.OrderItem;
import com.uade.tpo.demo.purchaseservice.entity.OrderStatusHistory;
import com.uade.tpo.demo.purchaseservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final BigDecimal SHIPPING_COST = new BigDecimal("15.00");
    private static final BigDecimal TAX_RATE = new BigDecimal("0.21"); // 21% IVA
    private static final String CURRENCY = "ARS";

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final DiscountService discountService;
    private final AtomicInteger orderCounter = new AtomicInteger(1000);

    public OrderService(OrderRepository orderRepository, CartService cartService, DiscountService discountService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.discountService = discountService;
    }

    public OrderResponse checkout(CheckoutRequest request) {
        CartResponse cart = cartService.getCartById(request.getCartId());

        if (!CartStatus.ACTIVE.equals(cart.getStatus())) {
            throw new IllegalStateException("El carrito no está activo");
        }
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío");
        }

        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal discountTotal = BigDecimal.ZERO;

        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            Optional<Discount> discount = discountService.findValidByCode(request.getDiscountCode());
            if (discount.isPresent()) {
                discountTotal = subtotal
                    .multiply(discount.get().getPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal afterDiscount = subtotal.subtract(discountTotal);
        BigDecimal taxTotal = afterDiscount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = afterDiscount.add(taxTotal).add(SHIPPING_COST);

        String shippingSnapshot = buildShippingSnapshot(request);

        List<OrderItem> orderItems = cart.getItems().stream()
            .map(item -> OrderItem.builder()
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productSku(item.getProductSku())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getLineTotal())
                .build())
            .collect(Collectors.toList());

        Order order = Order.builder()
            .orderNumber(generateOrderNumber())
            .customerId(request.getCustomerId())
            .status(OrderStatus.PENDING)
            .items(orderItems)
            .subtotal(subtotal)
            .discountTotal(discountTotal)
            .shippingTotal(SHIPPING_COST)
            .taxTotal(taxTotal)
            .grandTotal(grandTotal)
            .currency(CURRENCY)
            .shippingSnapshot(shippingSnapshot)
            .placedAt(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        OrderStatusHistory initialHistory = OrderStatusHistory.builder()
            .previousStatus(null)
            .newStatus(OrderStatus.PENDING)
            .note("Orden creada")
            .createdAt(LocalDateTime.now())
            .build();
        order.getStatusHistory().add(initialHistory);

        Order saved = orderRepository.save(order);

        // Sincronizar IDs de items y historial con el ID de la orden
        saved.getItems().forEach(item -> item.setOrderId(saved.getId()));
        saved.getStatusHistory().forEach(h -> h.setOrderId(saved.getId()));

        cartService.markAsConverted(request.getCartId());

        return toResponse(saved);
    }

    public OrderResponse getOrder(Integer id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + id));
        return toResponse(order);
    }

    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + orderNumber));
        return toResponse(order);
    }

    public List<OrderResponse> getOrdersByCustomer(Integer customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public OrderResponse updateStatus(Integer id, OrderStatus newStatus, String note, Integer changedBy) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + id));

        OrderStatus previousStatus = order.getStatus();

        if (!isValidTransition(previousStatus, newStatus)) {
            throw new IllegalStateException(
                "Transición de estado inválida: " + previousStatus + " → " + newStatus);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        if (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED) {
            order.setUpdatedAt(LocalDateTime.now());
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
            .orderId(order.getId())
            .previousStatus(previousStatus)
            .newStatus(newStatus)
            .changedBy(changedBy)
            .note(note)
            .createdAt(LocalDateTime.now())
            .build();
        order.getStatusHistory().add(history);

        return toResponse(orderRepository.save(order));
    }

    public OrderResponse cancelOrder(Integer id, String reason, Integer changedBy) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + id));

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("No se puede cancelar una orden ya enviada o entregada");
        }

        return updateStatus(id, OrderStatus.CANCELLED, reason, changedBy);
    }

    // ---- helpers ----

    private boolean isValidTransition(OrderStatus from, OrderStatus to) {
        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED -> to == OrderStatus.DELIVERED;
            case DELIVERED -> to == OrderStatus.REFUNDED;
            default -> false;
        };
    }

    private String generateOrderNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "ORD-" + date + "-" + orderCounter.getAndIncrement();
    }

    private String buildShippingSnapshot(CheckoutRequest req) {
        return String.format(
            "{\"firstName\":\"%s\",\"lastName\":\"%s\",\"phone\":\"%s\"," +
            "\"line1\":\"%s\",\"line2\":\"%s\",\"city\":\"%s\"," +
            "\"region\":\"%s\",\"postalCode\":\"%s\",\"countryCode\":\"%s\"}",
            nullSafe(req.getFirstName()), nullSafe(req.getLastName()), nullSafe(req.getPhone()),
            nullSafe(req.getLine1()), nullSafe(req.getLine2()), nullSafe(req.getCity()),
            nullSafe(req.getRegion()), nullSafe(req.getPostalCode()), nullSafe(req.getCountryCode())
        );
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
            .map(item -> OrderItemResponse.builder()
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productSku(item.getProductSku())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build())
            .collect(Collectors.toList());

        List<OrderStatusHistoryResponse> historyResponses = order.getStatusHistory().stream()
            .map(h -> OrderStatusHistoryResponse.builder()
                .previousStatus(h.getPreviousStatus())
                .newStatus(h.getNewStatus())
                .note(h.getNote())
                .changedAt(h.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .customerId(order.getCustomerId())
            .status(order.getStatus())
            .items(itemResponses)
            .subtotal(order.getSubtotal())
            .discountTotal(order.getDiscountTotal())
            .shippingTotal(order.getShippingTotal())
            .taxTotal(order.getTaxTotal())
            .grandTotal(order.getGrandTotal())
            .currency(order.getCurrency())
            .shippingSnapshot(order.getShippingSnapshot())
            .placedAt(order.getPlacedAt())
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .statusHistory(historyResponses)
            .build();
    }
}

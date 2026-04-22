package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.catalogservice.discount.entity.Discount;
import com.uade.tpo.demo.catalogservice.discount.service.DiscountService;
import com.uade.tpo.demo.catalogservice.entity.Product;
import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import com.uade.tpo.demo.purchaseservice.dto.order.CheckoutRequest;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderItemResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderResponse;
import com.uade.tpo.demo.purchaseservice.dto.order.OrderStatusHistoryResponse;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import com.uade.tpo.demo.purchaseservice.entity.CartItem;
import com.uade.tpo.demo.purchaseservice.entity.Order;
import com.uade.tpo.demo.purchaseservice.entity.OrderItem;
import com.uade.tpo.demo.purchaseservice.entity.OrderStatusHistory;
import com.uade.tpo.demo.purchaseservice.exception.CarritoInactivoException;
import com.uade.tpo.demo.purchaseservice.exception.CarritoNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.exception.ProductoNoEncontradoException;
import com.uade.tpo.demo.purchaseservice.exception.SolicitudInvalidaException;
import com.uade.tpo.demo.purchaseservice.exception.StockInsuficienteException;
import com.uade.tpo.demo.purchaseservice.repository.CartRepository;
import com.uade.tpo.demo.purchaseservice.repository.OrderRepository;
import com.uade.tpo.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private static final BigDecimal SHIPPING_COST = new BigDecimal("15.00");
    private static final BigDecimal TAX_RATE = new BigDecimal("0.21");
    private static final String CURRENCY = "ARS";

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final DiscountService discountService;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        ProductRepository productRepository,
                        DiscountService discountService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.discountService = discountService;
    }

    public OrderResponse checkout(CheckoutRequest request) {
        if (request == null || request.getCartId() == null) {
            throw new SolicitudInvalidaException("El cartId es obligatorio");
        }

        Cart cart = cartRepository.findById(request.getCartId())
            .orElseThrow(() -> new CarritoNoEncontradoException(request.getCartId()));

        if (!CartStatus.ACTIVE.equals(cart.getStatus())) {
            throw new CarritoInactivoException(cart.getId(), cart.getStatus());
        }
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new SolicitudInvalidaException("El carrito está vacío");
        }

        // Stock check + subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product == null) {
                throw new ProductoNoEncontradoException((Integer) null);
            }
            if (product.getStock() == null || product.getStock() < item.getQuantity()) {
                throw new StockInsuficienteException(product.getId(),
                    item.getQuantity(), product.getStock() != null ? product.getStock() : 0);
            }
            BigDecimal unit = item.getUnitPrice() != null ? item.getUnitPrice() : product.getPrice();
            subtotal = subtotal.add(unit.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Discount
        BigDecimal discountTotal = BigDecimal.ZERO;
        Discount appliedDiscount = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            Optional<Discount> valid = discountService.findValidByCode(request.getDiscountCode());
            if (valid.isPresent()) {
                appliedDiscount = valid.get();
                discountTotal = appliedDiscount.calculateDiscount(subtotal)
                    .setScale(2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal afterDiscount = subtotal.subtract(discountTotal);
        BigDecimal taxTotal = afterDiscount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = afterDiscount.add(taxTotal).add(SHIPPING_COST);

        Long userId = cart.getUserId() != null
            ? cart.getUserId()
            : (request.getCustomerId() != null ? request.getCustomerId().longValue() : null);

        Order order = Order.builder()
            .orderNumber(generateOrderNumber())
            .userId(userId)
            .status(OrderStatus.PENDING)
            .subtotal(subtotal)
            .discountTotal(discountTotal)
            .shippingTotal(SHIPPING_COST)
            .taxTotal(taxTotal)
            .grandTotal(grandTotal)
            .currency(CURRENCY)
            .shippingSnapshot(buildShippingSnapshot(request))
            .placedAt(LocalDateTime.now())
            .build();

        // Build OrderItems, wire back-reference, decrement stock
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal unit = item.getUnitPrice() != null ? item.getUnitPrice() : product.getPrice();
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                .product(product)
                .productName(product.getName())
                .unitPrice(unit)
                .quantity(item.getQuantity())
                .lineTotal(lineTotal)
                .build();
            order.addItem(orderItem);

            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        // Initial status history
        OrderStatusHistory initial = OrderStatusHistory.builder()
            .previousStatus(null)
            .newStatus(OrderStatus.PENDING)
            .note("Orden creada")
            .changedBy(userId)
            .build();
        order.addStatusHistory(initial);

        Order saved = orderRepository.save(order);

        // Mark cart converted
        cart.setStatus(CartStatus.CONVERTED);
        cartRepository.save(cart);

        // Record discount usage if applied
        if (appliedDiscount != null) {
            appliedDiscount.setUsesCount(
                (appliedDiscount.getUsesCount() != null ? appliedDiscount.getUsesCount() : 0) + 1);
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + id));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + orderNumber));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(Long userId) {
        return orderRepository.findByUserId(userId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public OrderResponse updateStatus(Long id, OrderStatus newStatus, String note, Long changedBy) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + id));

        OrderStatus previous = order.getStatus();
        if (!isValidTransition(previous, newStatus)) {
            throw new IllegalStateException(
                "Transición de estado inválida: " + previous + " → " + newStatus);
        }

        order.setStatus(newStatus);

        OrderStatusHistory history = OrderStatusHistory.builder()
            .previousStatus(previous)
            .newStatus(newStatus)
            .changedBy(changedBy)
            .note(note)
            .build();
        order.addStatusHistory(history);

        return toResponse(orderRepository.save(order));
    }

    public OrderResponse cancelOrder(Long id, String reason, Long changedBy) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + id));

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("No se puede cancelar una orden ya enviada o entregada");
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock((product.getStock() != null ? product.getStock() : 0) + item.getQuantity());
                productRepository.save(product);
            }
        }

        return updateStatus(id, OrderStatus.CANCELLED, reason, changedBy);
    }

    // ---------- helpers ----------

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
        int suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "ORD-" + date + "-" + suffix;
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
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .lineTotal(item.getLineTotal())
                .build())
            .collect(Collectors.toList());

        List<OrderStatusHistoryResponse> historyResponses = order.getStatusHistory().stream()
            .map(h -> OrderStatusHistoryResponse.builder()
                .previousStatus(h.getPreviousStatus())
                .newStatus(h.getNewStatus())
                .note(h.getNote())
                .changedAt(h.getChangedAt())
                .build())
            .collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .userId(order.getUserId())
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

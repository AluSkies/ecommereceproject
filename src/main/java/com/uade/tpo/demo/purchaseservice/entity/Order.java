package com.uade.tpo.demo.purchaseservice.entity;

import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    private Integer id;
    private String orderNumber;
    private Integer customerId;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal shippingTotal;
    private BigDecimal taxTotal;
    private BigDecimal grandTotal;
    private String currency;
    private String shippingSnapshot; // JSON con datos de envío al momento de la compra
    private LocalDateTime placedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();
}

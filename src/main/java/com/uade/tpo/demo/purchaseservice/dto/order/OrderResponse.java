package com.uade.tpo.demo.purchaseservice.dto.order;

import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal shippingTotal;
    private BigDecimal taxTotal;
    private BigDecimal grandTotal;
    private String currency;
    private String shippingSnapshot;
    private LocalDateTime placedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderStatusHistoryResponse> statusHistory;
}

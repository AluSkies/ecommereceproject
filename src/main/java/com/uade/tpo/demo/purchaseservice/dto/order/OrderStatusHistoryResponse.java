package com.uade.tpo.demo.purchaseservice.dto.order;

import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderStatusHistoryResponse {
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private String note;
    private LocalDateTime changedAt;
}

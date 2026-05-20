package com.uade.tpo.demo.entity.dto;

import com.uade.tpo.demo.domain.OrderStatus;
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

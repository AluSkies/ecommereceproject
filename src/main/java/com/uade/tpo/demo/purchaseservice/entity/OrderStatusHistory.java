package com.uade.tpo.demo.purchaseservice.entity;

import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusHistory {
    private Integer id;
    private Integer orderId;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private Integer changedBy;
    private String note;
    private LocalDateTime createdAt;
}

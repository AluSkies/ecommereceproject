package com.uade.tpo.demo.purchaseservice.dto.discount;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DiscountResponse {
    private Integer id;
    private String code;
    private String name;
    private BigDecimal percentage;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private boolean active;
    private LocalDateTime createdAt;
}

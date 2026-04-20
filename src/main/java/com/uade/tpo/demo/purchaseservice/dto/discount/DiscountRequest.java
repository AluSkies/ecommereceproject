package com.uade.tpo.demo.purchaseservice.dto.discount;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DiscountRequest {
    private String code;
    private String name;
    private BigDecimal percentage;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private boolean active;
}

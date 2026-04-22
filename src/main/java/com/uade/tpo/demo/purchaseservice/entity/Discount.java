package com.uade.tpo.demo.purchaseservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount {
    private Integer id;
    private String code;
    private String name;
    private BigDecimal percentage;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private boolean isActive;
    private LocalDateTime createdAt;

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive
            && (startsAt == null || !now.isBefore(startsAt))
            && (endsAt == null || !now.isAfter(endsAt));
    }
}

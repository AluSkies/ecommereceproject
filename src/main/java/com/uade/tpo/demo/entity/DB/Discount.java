package com.uade.tpo.demo.entity.DB;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discounts")
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String name;
    private Double percentage;

    private LocalDateTime startsAt;
    private LocalDateTime endsAt;

    private Boolean isActive;

    private LocalDateTime createdAt;
}
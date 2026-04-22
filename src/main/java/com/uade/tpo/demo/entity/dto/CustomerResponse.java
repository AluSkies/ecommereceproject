package com.uade.tpo.demo.entity.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private Long id;
    private Long userId;
    private String username;
    private String phone;
    private String documentType;
    private String documentNumber;
    private LocalDate birthDate;
    private Long preferredShippingAddressId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

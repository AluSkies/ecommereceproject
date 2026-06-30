package com.uade.tpo.demo.entity.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private Long id;
    private Long customerId;
    private String label;
    private String street;
    private String streetNumber;
    private String apartment;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

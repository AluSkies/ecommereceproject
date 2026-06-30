package com.uade.tpo.demo.entity.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @Size(max = 30)
    private String phone;

    @Size(max = 10)
    private String documentType;

    @Size(max = 50)
    private String documentNumber;

    private LocalDate birthDate;

    private Long preferredShippingAddressId;
}

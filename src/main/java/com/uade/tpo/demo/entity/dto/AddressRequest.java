package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @Size(max = 50)
    private String label;

    @NotBlank
    @Size(max = 150)
    private String street;

    @Size(max = 20)
    private String streetNumber;

    @Size(max = 20)
    private String apartment;

    @NotBlank
    @Size(max = 80)
    private String city;

    @Size(max = 80)
    private String state;

    @Size(max = 80)
    private String country;

    @Size(max = 20)
    private String postalCode;

    private Boolean isDefault;
}

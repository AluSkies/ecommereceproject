package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {

    // ===== USER =====

    @Email(message = "El formato del email no es válido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String email;

    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;

    // ===== CUSTOMER INFO =====

    @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
    private String firstName;

    @Size(max = 50, message = "El apellido no puede exceder 50 caracteres")
    private String lastName;

    @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
    private String phone;

    // ===== DIRECCIÓN =====

    @Size(max = 100, message = "La dirección no puede exceder 100 caracteres")
    private String line1;

    @Size(max = 100, message = "La dirección adicional no puede exceder 100 caracteres")
    private String line2;

    @Size(max = 50, message = "La ciudad no puede exceder 50 caracteres")
    private String city;

    @Size(max = 50, message = "La región no puede exceder 50 caracteres")
    private String region;

    @Size(max = 20, message = "El código postal no puede exceder 20 caracteres")
    private String postalCode;

    @Size(max = 10, message = "El código de país no puede exceder 10 caracteres")
    private String countryCode;
}
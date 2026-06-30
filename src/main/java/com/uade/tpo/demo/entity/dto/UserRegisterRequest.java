package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegisterRequest {

    // ===== USER =====

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;

    // ===== CUSTOMER INFO =====

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 50, message = "El apellido no puede exceder 50 caracteres")
    private String lastName;

    @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
    private String phone;

    // ===== DIRECCIÓN =====

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 100, message = "La dirección no puede exceder 100 caracteres")
    private String line1;

    @Size(max = 100, message = "La dirección adicional no puede exceder 100 caracteres")
    private String line2;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 50, message = "La ciudad no puede exceder 50 caracteres")
    private String city;

    @Size(max = 50, message = "La región no puede exceder 50 caracteres")
    private String region;

    @NotBlank(message = "El código postal es obligatorio")
    @Size(max = 20, message = "El código postal no puede exceder 20 caracteres")
    private String postalCode;

    @NotBlank(message = "El país es obligatorio")
    @Size(max = 10, message = "El código de país no puede exceder 10 caracteres")
    private String countryCode;
}
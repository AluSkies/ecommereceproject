package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserLoginRequest {

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
    @NotBlank(message = "El nombre de usuario es obligatorio")
    private String username;
}

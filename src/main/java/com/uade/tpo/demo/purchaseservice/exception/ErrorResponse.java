package com.uade.tpo.demo.purchaseservice.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Respuesta de error estandarizada
 * Standardized error response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String codigo;
    private String mensaje;
    private LocalDateTime timestamp;
    private String ruta;

    public static ErrorResponse of(String codigo, String mensaje, String ruta) {
        return ErrorResponse.builder()
            .codigo(codigo)
            .mensaje(mensaje)
            .timestamp(LocalDateTime.now())
            .ruta(ruta)
            .build();
    }
}

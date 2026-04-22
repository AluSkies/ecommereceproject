package com.uade.tpo.demo.purchaseservice.exception;

/**
 * Se lanza cuando los datos de la solicitud son inválidos
 * Thrown when request data is invalid
 */
public class SolicitudInvalidaException extends CarritoException {
    public SolicitudInvalidaException(String campo) {
        super(String.format("Campo requerido '%s' no proporciona un valor válido", campo));
    }

    public SolicitudInvalidaException(String mensaje, Exception causa) {
        super(mensaje, causa);
    }
}

package com.uade.tpo.demo.purchaseservice.exception;

/**
 * Se lanza cuando la cantidad es inválida
 * Thrown when quantity is invalid
 */
public class CantidadInvalidaException extends CarritoException {
    public CantidadInvalidaException() {
        super("La cantidad debe ser mayor que cero");
    }

    public CantidadInvalidaException(Integer cantidad) {
        super(String.format("Cantidad inválida: %d. Debe ser mayor que cero", cantidad));
    }

    public CantidadInvalidaException(String mensaje) {
        super(mensaje);
    }
}

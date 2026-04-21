package com.uade.tpo.demo.purchaseservice.exception;

/**
 * Excepción base para operaciones del carrito
 * Base exception for cart operations
 */
public class CarritoException extends RuntimeException {
    public CarritoException(String mensaje) {
        super(mensaje);
    }

    public CarritoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}

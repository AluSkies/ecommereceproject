package com.uade.tpo.demo.purchaseservice.exception;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;

/**
 * Se lanza cuando se intenta operar en un carrito inactivo
 * Thrown when attempting operations on inactive cart
 */
public class CarritoInactivoException extends CarritoException {
    public CarritoInactivoException(Integer carritoId, CartStatus estado) {
        super(String.format(
            "El carrito con ID %d no está activo. Estado actual: %s",
            carritoId, estado
        ));
    }

    public CarritoInactivoException(CartStatus estado) {
        super(String.format(
            "No se puede realizar esta operación. El carrito no está activo (Estado: %s)",
            estado
        ));
    }
}

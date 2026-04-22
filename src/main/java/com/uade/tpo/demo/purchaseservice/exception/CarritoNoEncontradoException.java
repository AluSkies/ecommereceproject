package com.uade.tpo.demo.purchaseservice.exception;

/**
 * Se lanza cuando el carrito no existe
 * Thrown when cart does not exist
 */
public class CarritoNoEncontradoException extends CarritoException {
    public CarritoNoEncontradoException(Integer carritoId) {
        super(String.format("El carrito con ID %d no fue encontrado", carritoId));
    }

    public CarritoNoEncontradoException(String tipo, String valor) {
        super(String.format("No se encontró carrito para %s: %s", tipo, valor));
    }
}

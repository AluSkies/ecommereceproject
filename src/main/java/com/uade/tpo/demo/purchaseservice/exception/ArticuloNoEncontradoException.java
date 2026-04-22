package com.uade.tpo.demo.purchaseservice.exception;

/**
 * Se lanza cuando un artículo no se encuentra en el carrito
 * Thrown when item is not found in cart
 */
public class ArticuloNoEncontradoException extends CarritoException {
    public ArticuloNoEncontradoException(Integer productoId) {
        super(String.format(
            "El producto con ID %d no se encuentra en el carrito",
            productoId
        ));
    }

    public ArticuloNoEncontradoException(Integer carritoId, Integer productoId) {
        super(String.format(
            "El producto ID %d no existe en el carrito ID %d",
            productoId, carritoId
        ));
    }
}

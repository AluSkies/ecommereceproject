package com.uade.tpo.demo.purchaseservice.exception;

/**
 * Se lanza cuando el producto no existe
 * Thrown when product does not exist
 */
public class ProductoNoEncontradoException extends CarritoException {
    public ProductoNoEncontradoException(Integer productoId) {
        super(String.format("El producto con ID %d no fue encontrado", productoId));
    }

    public ProductoNoEncontradoException(String sku) {
        super(String.format("El producto con SKU '%s' no fue encontrado", sku));
    }
}

package com.uade.tpo.demo.purchaseservice.exception;

/**
 * Se lanza cuando no hay suficiente stock disponible
 * Thrown when insufficient stock is available
 */
public class StockInsuficienteException extends CarritoException {
    public StockInsuficienteException(Integer productoId, Integer solicitado, Integer disponible) {
        super(String.format(
            "Stock insuficiente para el producto ID %d. Solicitado: %d, Disponible: %d",
            productoId, solicitado, disponible
        ));
    }

    public StockInsuficienteException(String nombreProducto, Integer solicitado, Integer disponible) {
        super(String.format(
            "Stock insuficiente para '%s'. Solicitado: %d, Disponible: %d",
            nombreProducto, solicitado, disponible
        ));
    }
}

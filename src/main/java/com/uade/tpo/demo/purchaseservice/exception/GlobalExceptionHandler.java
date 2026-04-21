package com.uade.tpo.demo.purchaseservice.exception;

import com.uade.tpo.demo.exceptions.InvalidCredentialsException;
import com.uade.tpo.demo.exceptions.UserAlreadyExistsException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Manejador global de excepciones para la API de carrito
 * Global exception handler for cart API
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Maneja cuando un carrito no es encontrado
     */
    @ExceptionHandler(CarritoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleCarritoNoEncontrado(
        CarritoNoEncontradoException ex, HttpServletRequest request) {
        log.warn("Carrito no encontrado: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "CARRITO_NO_ENCONTRADO",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Maneja cuando un producto no es encontrado
     */
    @ExceptionHandler(ProductoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleProductoNoEncontrado(
        ProductoNoEncontradoException ex, HttpServletRequest request) {
        log.warn("Producto no encontrado: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "PRODUCTO_NO_ENCONTRADO",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Maneja cuando hay stock insuficiente
     */
    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ErrorResponse> handleStockInsuficiente(
        StockInsuficienteException ex, HttpServletRequest request) {
        log.warn("Stock insuficiente: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "STOCK_INSUFICIENTE",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Maneja cuando la cantidad es inválida
     */
    @ExceptionHandler(CantidadInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleCantidadInvalida(
        CantidadInvalidaException ex, HttpServletRequest request) {
        log.warn("Cantidad inválida: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "CANTIDAD_INVALIDA",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Maneja cuando una solicitud tiene datos inválidos
     */
    @ExceptionHandler(SolicitudInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleSolicitudInvalida(
        SolicitudInvalidaException ex, HttpServletRequest request) {
        log.warn("Solicitud inválida: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "SOLICITUD_INVALIDA",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Maneja cuando se intenta operar sobre un carrito inactivo
     */
    @ExceptionHandler(CarritoInactivoException.class)
    public ResponseEntity<ErrorResponse> handleCarritoInactivo(
        CarritoInactivoException ex, HttpServletRequest request) {
        log.warn("Intento de operación en carrito inactivo: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "CARRITO_INACTIVO",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Maneja cuando un artículo no se encuentra en el carrito
     */
    @ExceptionHandler(ArticuloNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleArticuloNoEncontrado(
        ArticuloNoEncontradoException ex, HttpServletRequest request) {
        log.warn("Artículo no encontrado en carrito: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "ARTICULO_NO_ENCONTRADO",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Maneja todas las excepciones de carrito genéricas
     */
    @ExceptionHandler(CarritoException.class)
    public ResponseEntity<ErrorResponse> handleCarritoException(
        CarritoException ex, HttpServletRequest request) {
        log.error("Error en operación de carrito: {}", ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.of(
            "ERROR_CARRITO",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
        InvalidCredentialsException ex, HttpServletRequest request) {
        log.warn("Credenciales inválidas en {}", request.getRequestURI());
        ErrorResponse error = ErrorResponse.of(
            "CREDENCIALES_INVALIDAS",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(
        UserAlreadyExistsException ex, HttpServletRequest request) {
        log.warn("Conflicto al registrar usuario: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "USUARIO_YA_EXISTE",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
        UserNotFoundException ex, HttpServletRequest request) {
        log.warn("Usuario no encontrado: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "USUARIO_NO_ENCONTRADO",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
        AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Acceso denegado a {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
            "ACCESO_DENEGADO",
            "No tiene permisos suficientes para acceder a este recurso",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Maneja excepciones genéricas no capturadas
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
        Exception ex, HttpServletRequest request) {
        log.error("Error inesperado: {}", ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.of(
            "ERROR_INTERNO",
            "Ocurrió un error inesperado. Por favor, intente nuevamente.",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

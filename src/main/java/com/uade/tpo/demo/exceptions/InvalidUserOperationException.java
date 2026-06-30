package com.uade.tpo.demo.exceptions;

public class InvalidUserOperationException extends RuntimeException {
    public InvalidUserOperationException(String message) {
        super(message);
    }
}
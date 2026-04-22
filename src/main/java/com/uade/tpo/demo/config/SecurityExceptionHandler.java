package com.uade.tpo.demo.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityExceptionHandler implements AccessDeniedHandler{

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        String errorMessage = "Usuario no autorizado. No tienes permisos para acceder a este recurso.";
        
        // Crear respuesta JSON personalizada
        String jsonResponse = String.format(
            "{\"error\": \"%s\", \"status\": %d, \"message\": \"%s\"}", 
            "FORBIDDEN", 
            HttpStatus.FORBIDDEN.value(), 
            errorMessage
        );
        
        response.getWriter().write(jsonResponse);
    }
    
}

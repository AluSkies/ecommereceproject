package com.uade.tpo.demo.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        String errorMessage = "Por favor, inicia sesión.";
        
        // Crear respuesta JSON personalizada
        String jsonResponse = String.format(
            "{\"error\": \"%s\", \"status\": %d, \"message\": \"%s\"}", 
            "UNAUTHORIZED", 
            HttpStatus.UNAUTHORIZED.value(), 
            errorMessage
        );
        
        response.getWriter().write(jsonResponse);
    }
}

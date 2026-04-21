package com.uade.tpo.demo.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.dto.UserLoginRequest;
import com.uade.tpo.demo.entity.dto.UserRegisterRequest;
import com.uade.tpo.demo.entity.dto.UserResponse;
import com.uade.tpo.demo.entity.enums.AuditEventType;
import com.uade.tpo.demo.exceptions.InvalidCredentialsException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import com.uade.tpo.demo.repository.UserRepository;
import com.uade.tpo.demo.security.AuditService;
import com.uade.tpo.demo.security.JwtService;
import com.uade.tpo.demo.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthResponse register(UserRegisterRequest request) {
        UserResponse userResponse = userService.registerUser(request);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado tras registro"));

        String token = jwtService.generateToken(user);

        auditService.logEvent(AuditEventType.REGISTER, user.getUserId(), user.getUsername(), true,
                "Usuario registrado");
        auditService.logEvent(AuditEventType.TOKEN_ISSUED, user.getUserId(), user.getUsername(), true,
                "Token emitido en registro");

        return AuthResponse.builder()
                .token(token)
                .expiresIn(jwtService.getExpirationMs())
                .user(userResponse)
                .build();
    }

    public AuthResponse login(UserLoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (AuthenticationException e) {
            auditService.logEvent(AuditEventType.LOGIN_FAILURE, null, request.getUsername(), false,
                    e.getMessage());
            throw new InvalidCredentialsException("Credenciales inválidas");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        String token = jwtService.generateToken(user);

        auditService.logEvent(AuditEventType.LOGIN_SUCCESS, user.getUserId(), user.getUsername(), true,
                "Login exitoso");
        auditService.logEvent(AuditEventType.TOKEN_ISSUED, user.getUserId(), user.getUsername(), true,
                "Token emitido en login");

        UserResponse userResponse = toUserResponse(user);

        return AuthResponse.builder()
                .token(token)
                .expiresIn(jwtService.getExpirationMs())
                .user(userResponse)
                .build();
    }

    public void logout() {
        // JWT es stateless: el token no se invalida del lado del servidor, solo se limpia el contexto.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User user) {
            auditService.logEvent(AuditEventType.LOGOUT, user.getUserId(), user.getUsername(), true,
                    "Logout solicitado");
        }
        SecurityContextHolder.clearContext();
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setIdUser(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setRegistrationDate(user.getRegistrationDate());
        return response;
    }
}

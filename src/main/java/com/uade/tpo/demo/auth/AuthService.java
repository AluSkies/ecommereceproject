package com.uade.tpo.demo.auth;

import java.util.Date;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.CustomerInfo;
import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.dto.UserLoginRequest;
import com.uade.tpo.demo.entity.dto.UserRegisterRequest;
import com.uade.tpo.demo.entity.dto.UserResponse;
import com.uade.tpo.demo.entity.enums.AuditEventType;
import com.uade.tpo.demo.entity.enums.Role;
import com.uade.tpo.demo.exceptions.InvalidCredentialsException;
import com.uade.tpo.demo.exceptions.UserAlreadyExistsException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import com.uade.tpo.demo.repository.UserRepository;
import com.uade.tpo.demo.security.AuditService;
import com.uade.tpo.demo.security.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthResponse register(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("El email ya está registrado");
        }

        Date now = new Date();

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.BUYER)
                .emailVerified(false)
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        CustomerInfo customerInfo = CustomerInfo.builder()
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .line1(request.getLine1())
                .line2(request.getLine2())
                .city(request.getCity())
                .region(request.getRegion())
                .postalCode(request.getPostalCode())
                .countryCode(request.getCountryCode())
                .createdAt(now)
                .updatedAt(now)
                .build();

        user.setCustomerInfo(customerInfo);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        auditService.logEvent(AuditEventType.REGISTER, savedUser.getId(), savedUser.getEmail(), true,
                "Usuario registrado");
        auditService.logEvent(AuditEventType.TOKEN_ISSUED, savedUser.getId(), savedUser.getEmail(), true,
                "Token emitido en registro");

        return AuthResponse.builder()
                .token(token)
                .expiresIn(jwtService.getExpirationMs())
                .user(toUserResponse(savedUser))
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

        User user = userRepository.findByEmail(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        String token = jwtService.generateToken(user);

        auditService.logEvent(AuditEventType.LOGIN_SUCCESS, user.getId(), user.getEmail(), true,
                "Login exitoso");
        auditService.logEvent(AuditEventType.TOKEN_ISSUED, user.getId(), user.getEmail(), true,
                "Token emitido en login");

        return AuthResponse.builder()
                .token(token)
                .expiresIn(jwtService.getExpirationMs())
                .user(toUserResponse(user))
                .build();
    }

    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User user) {
            auditService.logEvent(AuditEventType.LOGOUT, user.getId(), user.getEmail(), true,
                    "Logout solicitado");
        }
        SecurityContextHolder.clearContext();
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setEmailVerified(user.getEmailVerified());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        if (user.getCustomerInfo() != null) {
            response.setFirstName(user.getCustomerInfo().getFirstName());
            response.setLastName(user.getCustomerInfo().getLastName());
            response.setPhone(user.getCustomerInfo().getPhone());
        }
        return response;
    }
}

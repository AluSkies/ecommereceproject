package com.uade.tpo.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.security.JwtService;
import com.uade.tpo.demo.entity.dto.AuthResponse;
import com.uade.tpo.demo.entity.dto.UserLoginRequest;
import com.uade.tpo.demo.entity.enums.Role;
import com.uade.tpo.demo.exceptions.InvalidCredentialsException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import com.uade.tpo.demo.repository.UserRepository;
import com.uade.tpo.demo.security.AuditService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    // use a real JwtService instance to avoid inline mocking issues with Byte Buddy on Java 25
    private JwtService jwtService;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AuditService auditService;

    private AuthService authService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        // set secret and expiration via reflection to avoid Spring @Value injection
        java.lang.reflect.Field secretField = JwtService.class.getDeclaredField("secret");
        secretField.setAccessible(true);
        secretField.set(jwtService, java.util.Base64.getEncoder().encodeToString("test-secret-key-which-is-long-enough-0123456789".getBytes()));
        java.lang.reflect.Field expField = JwtService.class.getDeclaredField("expirationMs");
        expField.setAccessible(true);
        expField.setLong(jwtService, 3600000L);

        authService = new AuthService(userRepository, jwtService, passwordEncoder, authenticationManager, auditService);
    }

    @Test
    void login_success_returnsTokenAndUser() {
        UserLoginRequest request = new UserLoginRequest();
        request.setUsername("user@example.com");
        request.setPassword("secret");

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .password("encoded")
                .role(Role.BUYER)
                .build();

        when(userRepository.findByEmail(eq("user@example.com"))).thenReturn(Optional.of(user));

        // authenticationManager.authenticate should not throw for success
        AuthResponse response = authService.login(request);

        // JwtService is real here so token is generated; assert it's not null and expiration matches configured value
        org.junit.jupiter.api.Assertions.assertNotNull(response.getToken());
        assertEquals(3600000L, response.getExpiresIn());
        assertEquals(user.getEmail(), response.getUser().getEmail());

        verify(auditService).logEvent(eq(com.uade.tpo.demo.entity.enums.AuditEventType.LOGIN_SUCCESS), eq(user.getId()), eq(user.getEmail()), eq(true), any());
        verify(auditService).logEvent(eq(com.uade.tpo.demo.entity.enums.AuditEventType.TOKEN_ISSUED), eq(user.getId()), eq(user.getEmail()), eq(true), any());
    }

    @Test
    void login_invalidCredentials_throwsInvalidCredentialsException() {
        UserLoginRequest request = new UserLoginRequest();
        request.setUsername("bad@example.com");
        request.setPassword("wrong");

        doThrow(new BadCredentialsException("Bad credentials")).when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));

        verify(auditService).logEvent(eq(com.uade.tpo.demo.entity.enums.AuditEventType.LOGIN_FAILURE), eq(null), eq("bad@example.com"), eq(false), any());
    }

    @Test
    void login_userNotFound_afterAuthentication_throwsUserNotFound() {
        UserLoginRequest request = new UserLoginRequest();
        request.setUsername("noone@example.com");
        request.setPassword("pwd");

        when(userRepository.findByEmail(eq("noone@example.com"))).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.login(request));
    }
}

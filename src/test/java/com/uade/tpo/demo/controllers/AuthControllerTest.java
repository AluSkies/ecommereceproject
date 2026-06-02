package com.uade.tpo.demo.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import com.uade.tpo.demo.entity.dto.AuthResponse;
import com.uade.tpo.demo.entity.dto.UserLoginRequest;
import com.uade.tpo.demo.entity.dto.UserResponse;
import com.uade.tpo.demo.entity.enums.Role;
import com.uade.tpo.demo.services.AuthService;

class AuthControllerTest {

    @Mock
    private AuthService authService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authController = new AuthController(authService);
    }

    @Test
    void postLogin_returnsAuthResponse() {
        UserLoginRequest req = new UserLoginRequest();
        req.setUsername("user@example.com");
        req.setPassword("secret");

        UserResponse userResponse = new UserResponse();
        userResponse.setEmail("user@example.com");
        userResponse.setId(1L);
        userResponse.setRole(Role.BUYER);

        AuthResponse response = AuthResponse.builder()
                .token("token-xyz")
                .expiresIn(3600000L)
                .user(userResponse)
                .build();

        when(authService.login(any(UserLoginRequest.class))).thenReturn(response);

        ResponseEntity<AuthResponse> resp = authController.login(req);

        assertEquals(200, resp.getStatusCodeValue());
        assertEquals("token-xyz", resp.getBody().getToken());
        assertEquals("user@example.com", resp.getBody().getUser().getEmail());
    }
}

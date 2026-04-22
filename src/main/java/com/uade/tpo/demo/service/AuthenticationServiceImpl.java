package com.uade.tpo.demo.service;

import java.util.Date;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.config.JwtService;
import com.uade.tpo.demo.entity.CustomerInfo;
import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.dto.AuthenticationRequest;
import com.uade.tpo.demo.entity.dto.AuthenticationResponse;
import com.uade.tpo.demo.entity.dto.UserRegisterRequest;
import com.uade.tpo.demo.entity.enums.Role;
import com.uade.tpo.demo.exceptions.InvalidCredentialsException;
import com.uade.tpo.demo.exceptions.InvalidUserOperationException;
import com.uade.tpo.demo.exceptions.UserAlreadyExistsException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import com.uade.tpo.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthenticationResponse register(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("El email ya está registrado");
        }

        Date now = new Date();

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.BUYER);
        user.setEmailVerified(false);
        user.setIsActive(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        CustomerInfo customerInfo = new CustomerInfo();
        customerInfo.setUser(user);
        customerInfo.setFirstName(request.getFirstName());
        customerInfo.setLastName(request.getLastName());
        customerInfo.setPhone(request.getPhone());
        customerInfo.setLine1(request.getLine1());
        customerInfo.setLine2(request.getLine2());
        customerInfo.setCity(request.getCity());
        customerInfo.setRegion(request.getRegion());
        customerInfo.setPostalCode(request.getPostalCode());
        customerInfo.setCountryCode(request.getCountryCode());
        customerInfo.setCreatedAt(now);
        customerInfo.setUpdatedAt(now);

        user.setCustomerInfo(customerInfo);

        User savedUser = userRepository.save(user);
        String jwtToken = jwtService.generateToken(savedUser);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Email o contraseña inválidos");
        } catch (DisabledException ex) {
            throw new InvalidUserOperationException("El usuario se encuentra deshabilitado");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        String jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }
}
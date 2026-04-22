package com.uade.tpo.demo.service;

import java.util.Date;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.CustomerInfo;
import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.dto.UserResponse;
import com.uade.tpo.demo.entity.dto.UserUpdateRequest;
import com.uade.tpo.demo.entity.enums.Role;
import com.uade.tpo.demo.exceptions.InvalidUserOperationException;
import com.uade.tpo.demo.exceptions.UnauthorizedUserAccessException;
import com.uade.tpo.demo.exceptions.UserAlreadyExistsException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import com.uade.tpo.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getUserById(Long id) {
        User loggedUser = getLoggedUser();
        validateSelfOrSellerAccess(loggedUser, id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con ID: " + id));

        return convertToUserResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User loggedUser = getLoggedUser();
        validateSelfOrSellerAccess(loggedUser, id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con ID: " + id));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("El email ya está registrado");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        CustomerInfo customerInfo = user.getCustomerInfo();
        if (customerInfo == null) {
            throw new InvalidUserOperationException("CustomerInfo no encontrado para el usuario");
        }

        if (request.getFirstName() != null) {
            customerInfo.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            customerInfo.setLastName(request.getLastName());
        }

        if (request.getPhone() != null) {
            customerInfo.setPhone(request.getPhone());
        }

        if (request.getLine1() != null) {
            customerInfo.setLine1(request.getLine1());
        }

        if (request.getLine2() != null) {
            customerInfo.setLine2(request.getLine2());
        }

        if (request.getCity() != null) {
            customerInfo.setCity(request.getCity());
        }

        if (request.getRegion() != null) {
            customerInfo.setRegion(request.getRegion());
        }

        if (request.getPostalCode() != null) {
            customerInfo.setPostalCode(request.getPostalCode());
        }

        if (request.getCountryCode() != null) {
            customerInfo.setCountryCode(request.getCountryCode());
        }

        Date now = new Date();
        user.setUpdatedAt(now);
        customerInfo.setUpdatedAt(now);

        User updatedUser = userRepository.save(user);

        return convertToUserResponse(updatedUser);
    }

    @Override
    public void disableUser(Long id) {
        User loggedUser = getLoggedUser();

        if (loggedUser.getRole() != Role.SELLER) {
            throw new UnauthorizedUserAccessException("Solo el usuario con rol SELLER puede deshabilitar usuarios");
        }

        User userToDisable = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con ID: " + id));

        if (loggedUser.getId().equals(userToDisable.getId())) {
            throw new InvalidUserOperationException("El usuario SELLER no puede deshabilitarse a sí mismo");
        }

        if (userToDisable.getRole() == Role.SELLER) {
            throw new InvalidUserOperationException("No se puede deshabilitar al usuario SELLER");
        }

        if (Boolean.FALSE.equals(userToDisable.getIsActive())) {
            throw new InvalidUserOperationException("El usuario ya se encuentra deshabilitado");
        }

        userToDisable.setIsActive(false);
        userToDisable.setUpdatedAt(new Date());

        userRepository.save(userToDisable);
    }

    @Override
    public User getLoggedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuario logueado no encontrado"));
    }

    @Override
    public UserResponse getLoggedUserResponse() {
        return convertToUserResponse(getLoggedUser());
    }

    private void validateSelfOrSellerAccess(User loggedUser, Long targetUserId) {
        boolean isSeller = loggedUser.getRole() == Role.SELLER;
        boolean isSelf = loggedUser.getId().equals(targetUserId);

        if (!isSeller && !isSelf) {
            throw new UnauthorizedUserAccessException("No tenés permisos para acceder a este usuario");
        }
    }

    private UserResponse convertToUserResponse(User user) {
        CustomerInfo customerInfo = user.getCustomerInfo();

        if (customerInfo == null) {
            throw new InvalidUserOperationException("CustomerInfo no encontrado para el usuario");
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setEmailVerified(user.getEmailVerified());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        response.setFirstName(customerInfo.getFirstName());
        response.setLastName(customerInfo.getLastName());
        response.setPhone(customerInfo.getPhone());
        response.setLine1(customerInfo.getLine1());
        response.setLine2(customerInfo.getLine2());
        response.setCity(customerInfo.getCity());
        response.setRegion(customerInfo.getRegion());
        response.setPostalCode(customerInfo.getPostalCode());
        response.setCountryCode(customerInfo.getCountryCode());

        return response;
    }
}

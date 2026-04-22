package com.uade.tpo.demo.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.demo.entity.AddressesOthers;
import com.uade.tpo.demo.entity.CustomersInfo;
import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.dto.CustomerRequest;
import com.uade.tpo.demo.entity.dto.CustomerResponse;
import com.uade.tpo.demo.exceptions.AddressNotFoundException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import com.uade.tpo.demo.repository.AddressesOthersRepository;
import com.uade.tpo.demo.repository.CustomersInfoRepository;
import com.uade.tpo.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomersInfoService {

    private final CustomersInfoRepository customersInfoRepository;
    private final AddressesOthersRepository addressesOthersRepository;
    private final UserRepository userRepository;

    public CustomerResponse getMyCustomerInfo() {
        User user = resolveCurrentUser();
        CustomersInfo customer = customersInfoRepository.findByUser_Id(user.getId())
                .orElseGet(() -> createEmptyCustomerInfo(user));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long customerId) {
        CustomersInfo customer = customersInfoRepository.findById(customerId)
                .orElseThrow(() -> new UserNotFoundException("Cliente no encontrado con ID: " + customerId));
        return toResponse(customer);
    }

    public CustomerResponse updateMyCustomerInfo(CustomerRequest req) {
        User user = resolveCurrentUser();
        CustomersInfo customer = customersInfoRepository.findByUser_Email(user.getEmail())
                .orElseGet(() -> createEmptyCustomerInfo(user));

        if (req.getPhone() != null) {
            customer.setPhone(req.getPhone());
        }
        if (req.getDocumentType() != null) {
            customer.setDocumentType(req.getDocumentType());
        }
        if (req.getDocumentNumber() != null) {
            customer.setDocumentNumber(req.getDocumentNumber());
        }
        if (req.getBirthDate() != null) {
            customer.setBirthDate(req.getBirthDate());
        }
        if (req.getPreferredShippingAddressId() != null) {
            AddressesOthers address = addressesOthersRepository.findById(req.getPreferredShippingAddressId())
                    .orElseThrow(() -> new AddressNotFoundException(
                            "Dirección no encontrada con ID: " + req.getPreferredShippingAddressId()));
            if (address.getCustomer() == null || !address.getCustomer().getId().equals(customer.getId())) {
                throw new AddressNotFoundException("La dirección no pertenece al cliente actual");
            }
            customer.setPreferredShippingAddress(address);
        }

        CustomersInfo saved = customersInfoRepository.save(customer);
        return toResponse(saved);
    }

    private CustomersInfo createEmptyCustomerInfo(User user) {
        CustomersInfo empty = CustomersInfo.builder()
                .user(user)
                .build();
        return customersInfoRepository.save(empty);
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new UserNotFoundException("Usuario no encontrado");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
    }

    private CustomerResponse toResponse(CustomersInfo customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .userId(customer.getUser() != null ? customer.getUser().getId() : null)
                .username(customer.getUser() != null ? customer.getUser().getEmail() : null)
                .phone(customer.getPhone())
                .documentType(customer.getDocumentType())
                .documentNumber(customer.getDocumentNumber())
                .birthDate(customer.getBirthDate())
                .preferredShippingAddressId(
                        customer.getPreferredShippingAddress() != null
                                ? customer.getPreferredShippingAddress().getId()
                                : null)
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}

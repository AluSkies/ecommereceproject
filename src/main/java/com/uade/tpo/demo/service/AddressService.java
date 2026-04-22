package com.uade.tpo.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.demo.entity.AddressesOthers;
import com.uade.tpo.demo.entity.CustomersInfo;
import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.dto.AddressRequest;
import com.uade.tpo.demo.entity.dto.AddressResponse;
import com.uade.tpo.demo.exceptions.AddressNotFoundException;
import com.uade.tpo.demo.exceptions.UserNotFoundException;
import com.uade.tpo.demo.repository.AddressesOthersRepository;
import com.uade.tpo.demo.repository.CustomersInfoRepository;
import com.uade.tpo.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final AddressesOthersRepository addressesOthersRepository;
    private final CustomersInfoRepository customersInfoRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> listMyAddresses() {
        User user = resolveCurrentUser();
        CustomersInfo customer = resolveOrCreateCustomer(user);
        return addressesOthersRepository.findByCustomer_Id(customer.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressResponse getById(Long id) {
        AddressesOthers address = addressesOthersRepository.findById(id)
                .orElseThrow(() -> new AddressNotFoundException("Dirección no encontrada con ID: " + id));
        return toResponse(address);
    }

    public AddressResponse createForCurrentUser(AddressRequest req) {
        User user = resolveCurrentUser();
        CustomersInfo customer = resolveOrCreateCustomer(user);

        AddressesOthers address = AddressesOthers.builder()
                .customer(customer)
                .label(req.getLabel())
                .street(req.getStreet())
                .streetNumber(req.getStreetNumber())
                .apartment(req.getApartment())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .postalCode(req.getPostalCode())
                .isDefault(Boolean.TRUE.equals(req.getIsDefault()))
                .build();

        if (Boolean.TRUE.equals(req.getIsDefault())) {
            unflagSiblings(customer.getId(), null);
        }

        AddressesOthers saved = addressesOthersRepository.save(address);
        return toResponse(saved);
    }

    public AddressResponse update(Long id, AddressRequest req) {
        AddressesOthers address = addressesOthersRepository.findById(id)
                .orElseThrow(() -> new AddressNotFoundException("Dirección no encontrada con ID: " + id));

        if (req.getLabel() != null) {
            address.setLabel(req.getLabel());
        }
        if (req.getStreet() != null) {
            address.setStreet(req.getStreet());
        }
        if (req.getStreetNumber() != null) {
            address.setStreetNumber(req.getStreetNumber());
        }
        if (req.getApartment() != null) {
            address.setApartment(req.getApartment());
        }
        if (req.getCity() != null) {
            address.setCity(req.getCity());
        }
        if (req.getState() != null) {
            address.setState(req.getState());
        }
        if (req.getCountry() != null) {
            address.setCountry(req.getCountry());
        }
        if (req.getPostalCode() != null) {
            address.setPostalCode(req.getPostalCode());
        }
        if (req.getIsDefault() != null) {
            if (Boolean.TRUE.equals(req.getIsDefault()) && address.getCustomer() != null) {
                unflagSiblings(address.getCustomer().getId(), address.getId());
            }
            address.setIsDefault(req.getIsDefault());
        }

        AddressesOthers saved = addressesOthersRepository.save(address);
        return toResponse(saved);
    }

    public void delete(Long id) {
        AddressesOthers address = addressesOthersRepository.findById(id)
                .orElseThrow(() -> new AddressNotFoundException("Dirección no encontrada con ID: " + id));

        CustomersInfo customer = address.getCustomer();
        if (customer != null
                && customer.getPreferredShippingAddress() != null
                && customer.getPreferredShippingAddress().getId().equals(address.getId())) {
            customer.setPreferredShippingAddress(null);
            customersInfoRepository.save(customer);
        }

        addressesOthersRepository.delete(address);
    }

    private void unflagSiblings(Long customerId, Long excludeAddressId) {
        List<AddressesOthers> siblings = addressesOthersRepository.findByCustomer_Id(customerId);
        for (AddressesOthers sibling : siblings) {
            if (excludeAddressId != null && sibling.getId().equals(excludeAddressId)) {
                continue;
            }
            if (Boolean.TRUE.equals(sibling.getIsDefault())) {
                sibling.setIsDefault(false);
                addressesOthersRepository.save(sibling);
            }
        }
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new UserNotFoundException("Usuario no encontrado");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
    }

    private CustomersInfo resolveOrCreateCustomer(User user) {
        return customersInfoRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> customersInfoRepository.save(
                        CustomersInfo.builder().user(user).build()));
    }

    private AddressResponse toResponse(AddressesOthers address) {
        return AddressResponse.builder()
                .id(address.getId())
                .customerId(address.getCustomer() != null ? address.getCustomer().getId() : null)
                .label(address.getLabel())
                .street(address.getStreet())
                .streetNumber(address.getStreetNumber())
                .apartment(address.getApartment())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}

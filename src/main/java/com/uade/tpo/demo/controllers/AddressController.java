package com.uade.tpo.demo.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.demo.entity.dto.AddressRequest;
import com.uade.tpo.demo.entity.dto.AddressResponse;
import com.uade.tpo.demo.service.AddressService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> listMine() {
        return ResponseEntity.ok(addressService.listMyAddresses());
    }

    @PostMapping
    public ResponseEntity<AddressResponse> create(@RequestBody @Valid AddressRequest request) {
        AddressResponse created = addressService.createForCurrentUser(request);
        return ResponseEntity.created(URI.create("/api/v1/addresses/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> update(
        @PathVariable Long id,
        @RequestBody @Valid AddressRequest request) {
        return ResponseEntity.ok(addressService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        addressService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

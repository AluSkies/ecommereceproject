package com.uade.tpo.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.demo.entity.dto.CustomerRequest;
import com.uade.tpo.demo.entity.dto.CustomerResponse;
import com.uade.tpo.demo.service.CustomersInfoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CustomersInfoController {

    private final CustomersInfoService customersInfoService;

    @GetMapping("/me")
    public ResponseEntity<CustomerResponse> getMyCustomerInfo() {
        return ResponseEntity.ok(customersInfoService.getMyCustomerInfo());
    }

    @PutMapping("/me")
    public ResponseEntity<CustomerResponse> updateMyCustomerInfo(@RequestBody @Valid CustomerRequest req) {
        return ResponseEntity.ok(customersInfoService.updateMyCustomerInfo(req));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customersInfoService.getById(id));
    }
}

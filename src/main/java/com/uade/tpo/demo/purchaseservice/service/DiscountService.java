package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountResponse;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountResponse;
import com.uade.tpo.demo.purchaseservice.entity.Discount;
import com.uade.tpo.demo.purchaseservice.repository.DiscountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DiscountService {

    private final DiscountRepository discountRepository;

    public DiscountService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    public DiscountResponse createDiscount(DiscountRequest request) {
        if (discountRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Código de descuento ya existe: " + request.getCode());
        }
        Discount discount = Discount.builder()
            .code(request.getCode().toUpperCase())
            .name(request.getName())
            .percentage(request.getPercentage())
            .startsAt(request.getStartsAt())
            .endsAt(request.getEndsAt())
            .isActive(request.isActive())
            .createdAt(LocalDateTime.now())
            .build();
        return toResponse(discountRepository.save(discount));
    }

    public List<DiscountResponse> getAllDiscounts() {
        return discountRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DiscountResponse> getActiveDiscounts() {
        return discountRepository.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Optional<DiscountResponse> getById(Integer id) {
        return discountRepository.findById(id).map(this::toResponse);
    }

    public ApplyDiscountResponse applyDiscount(BigDecimal subtotal, ApplyDiscountRequest request) {
        Discount discount = discountRepository.findByCode(request.getCode())
            .orElseThrow(() -> new IllegalArgumentException("Cupón no encontrado: " + request.getCode()));

        if (!discount.isValid()) {
            throw new IllegalStateException("El cupón no es válido o está vencido: " + request.getCode());
        }

        BigDecimal discountAmount = subtotal
            .multiply(discount.getPercentage())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal finalSubtotal = subtotal.subtract(discountAmount);

        return ApplyDiscountResponse.builder()
            .code(discount.getCode())
            .name(discount.getName())
            .percentage(discount.getPercentage())
            .discountAmount(discountAmount)
            .originalSubtotal(subtotal)
            .finalSubtotal(finalSubtotal)
            .build();
    }

    public DiscountResponse toggleActive(Integer id) {
        Discount discount = discountRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Descuento no encontrado: " + id));
        discount.setActive(!discount.isActive());
        return toResponse(discountRepository.save(discount));
    }

    public void deleteDiscount(Integer id) {
        discountRepository.delete(id);
    }

    public Optional<Discount> findValidByCode(String code) {
        return discountRepository.findByCode(code)
            .filter(Discount::isValid);
    }

    private DiscountResponse toResponse(Discount d) {
        return DiscountResponse.builder()
            .id(d.getId())
            .code(d.getCode())
            .name(d.getName())
            .percentage(d.getPercentage())
            .startsAt(d.getStartsAt())
            .endsAt(d.getEndsAt())
            .active(d.isActive())
            .createdAt(d.getCreatedAt())
            .build();
    }
}

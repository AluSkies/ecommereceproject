package com.uade.tpo.demo.purchaseservice.repository;

import com.uade.tpo.demo.purchaseservice.entity.Discount;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class DiscountRepository {

    private final List<Discount> discounts = new ArrayList<>();
    private Integer nextId = 1;

    public DiscountRepository() {
        initializeSampleData();
    }

    private void initializeSampleData() {
        discounts.add(Discount.builder()
            .id(nextId++)
            .code("RELOJES10")
            .name("10% descuento bienvenida")
            .percentage(new BigDecimal("10.00"))
            .startsAt(LocalDateTime.now().minusDays(30))
            .endsAt(LocalDateTime.now().plusDays(30))
            .isActive(true)
            .createdAt(LocalDateTime.now().minusDays(30))
            .build());

        discounts.add(Discount.builder()
            .id(nextId++)
            .code("LUXURY20")
            .name("20% descuento relojes de lujo")
            .percentage(new BigDecimal("20.00"))
            .startsAt(LocalDateTime.now().minusDays(10))
            .endsAt(LocalDateTime.now().plusDays(20))
            .isActive(true)
            .createdAt(LocalDateTime.now().minusDays(10))
            .build());
    }

    public Discount save(Discount discount) {
        if (discount.getId() == null) {
            discount.setId(nextId++);
            discounts.add(discount);
        } else {
            int index = -1;
            for (int i = 0; i < discounts.size(); i++) {
                if (discounts.get(i).getId().equals(discount.getId())) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) discounts.set(index, discount);
        }
        return discount;
    }

    public Optional<Discount> findById(Integer id) {
        return discounts.stream().filter(d -> d.getId().equals(id)).findFirst();
    }

    public Optional<Discount> findByCode(String code) {
        return discounts.stream()
            .filter(d -> d.getCode().equalsIgnoreCase(code))
            .findFirst();
    }

    public List<Discount> findAll() {
        return new ArrayList<>(discounts);
    }

    public List<Discount> findAllActive() {
        return discounts.stream().filter(Discount::isValid).collect(Collectors.toList());
    }

    public boolean existsByCode(String code) {
        return discounts.stream().anyMatch(d -> d.getCode().equalsIgnoreCase(code));
    }

    public void delete(Integer id) {
        discounts.removeIf(d -> d.getId().equals(id));
    }
}

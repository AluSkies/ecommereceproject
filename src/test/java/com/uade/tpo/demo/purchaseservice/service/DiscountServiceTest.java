package com.uade.tpo.demo.purchaseservice.service;

import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountResponse;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountResponse;
import com.uade.tpo.demo.purchaseservice.entity.Discount;
import com.uade.tpo.demo.purchaseservice.repository.DiscountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DiscountService")
class DiscountServiceTest {

    @Mock DiscountRepository discountRepository;
    @InjectMocks DiscountService discountService;

    private Discount validDiscount;

    @BeforeEach
    void setUp() {
        validDiscount = Discount.builder()
            .id(1)
            .code("RELOJES10")
            .name("10% bienvenida")
            .percentage(new BigDecimal("10.00"))
            .startsAt(LocalDateTime.now().minusDays(1))
            .endsAt(LocalDateTime.now().plusDays(30))
            .isActive(true)
            .createdAt(LocalDateTime.now().minusDays(1))
            .build();
    }

    // ──────────────────────────────────────────────────
    // createDiscount
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("createDiscount")
    class Create {

        @Test
        @DisplayName("crea el cupón y normaliza el código a mayúsculas")
        void createsDiscountAndUppercasesCode() {
            DiscountRequest req = buildRequest("relojes20", "20% off", new BigDecimal("20"), true);
            when(discountRepository.existsByCode("RELOJES20")).thenReturn(false);
            when(discountRepository.save(any())).thenAnswer(inv -> {
                Discount d = inv.getArgument(0);
                d.setId(2);
                return d;
            });

            DiscountResponse resp = discountService.createDiscount(req);

            assertThat(resp.getCode()).isEqualTo("RELOJES20");
            assertThat(resp.getPercentage()).isEqualByComparingTo(new BigDecimal("20"));
        }

        @Test
        @DisplayName("lanza excepción si el código ya existe")
        void throwsWhenCodeAlreadyExists() {
            DiscountRequest req = buildRequest("RELOJES10", "dup", new BigDecimal("10"), true);
            when(discountRepository.existsByCode("RELOJES10")).thenReturn(true);

            assertThatThrownBy(() -> discountService.createDiscount(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("RELOJES10");
        }
    }

    // ──────────────────────────────────────────────────
    // applyDiscount
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("applyDiscount")
    class Apply {

        @Test
        @DisplayName("calcula el descuento correcto sobre el subtotal")
        void calculatesCorrectDiscount() {
            when(discountRepository.findByCode("RELOJES10")).thenReturn(Optional.of(validDiscount));

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("RELOJES10");

            ApplyDiscountResponse resp = discountService.applyDiscount(new BigDecimal("1000.00"), req);

            assertThat(resp.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(resp.getFinalSubtotal()).isEqualByComparingTo(new BigDecimal("900.00"));
            assertThat(resp.getOriginalSubtotal()).isEqualByComparingTo(new BigDecimal("1000.00"));
            assertThat(resp.getPercentage()).isEqualByComparingTo(new BigDecimal("10.00"));
        }

        @Test
        @DisplayName("aplica descuento del 20% correctamente")
        void appliesTwentyPercentCorrectly() {
            Discount d20 = Discount.builder()
                .id(2).code("LUXURY20").name("20% lujo")
                .percentage(new BigDecimal("20.00"))
                .startsAt(LocalDateTime.now().minusDays(1))
                .endsAt(LocalDateTime.now().plusDays(10))
                .isActive(true).build();

            when(discountRepository.findByCode("LUXURY20")).thenReturn(Optional.of(d20));

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("LUXURY20");

            ApplyDiscountResponse resp = discountService.applyDiscount(new BigDecimal("9500.00"), req);

            assertThat(resp.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("1900.00"));
            assertThat(resp.getFinalSubtotal()).isEqualByComparingTo(new BigDecimal("7600.00"));
        }

        @Test
        @DisplayName("lanza excepción si el código no existe")
        void throwsWhenCodeNotFound() {
            when(discountRepository.findByCode("NOPE")).thenReturn(Optional.empty());

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("NOPE");

            assertThatThrownBy(() -> discountService.applyDiscount(new BigDecimal("500"), req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("NOPE");
        }

        @Test
        @DisplayName("lanza excepción si el cupón está inactivo")
        void throwsWhenDiscountIsInactive() {
            validDiscount.setActive(false);
            when(discountRepository.findByCode("RELOJES10")).thenReturn(Optional.of(validDiscount));

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("RELOJES10");

            assertThatThrownBy(() -> discountService.applyDiscount(new BigDecimal("500"), req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("válido");
        }

        @Test
        @DisplayName("lanza excepción si el cupón está vencido")
        void throwsWhenDiscountIsExpired() {
            validDiscount.setEndsAt(LocalDateTime.now().minusDays(1));
            when(discountRepository.findByCode("RELOJES10")).thenReturn(Optional.of(validDiscount));

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("RELOJES10");

            assertThatThrownBy(() -> discountService.applyDiscount(new BigDecimal("500"), req))
                .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("lanza excepción si el cupón aún no ha comenzado")
        void throwsWhenDiscountNotStartedYet() {
            validDiscount.setStartsAt(LocalDateTime.now().plusDays(5));
            when(discountRepository.findByCode("RELOJES10")).thenReturn(Optional.of(validDiscount));

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("RELOJES10");

            assertThatThrownBy(() -> discountService.applyDiscount(new BigDecimal("500"), req))
                .isInstanceOf(IllegalStateException.class);
        }
    }

    // ──────────────────────────────────────────────────
    // getAll / getActive / toggleActive
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("consultas y toggle")
    class Queries {

        @Test
        @DisplayName("getAllDiscounts devuelve todos los cupones")
        void getAllReturnsAll() {
            when(discountRepository.findAll()).thenReturn(List.of(validDiscount));

            List<DiscountResponse> result = discountService.getAllDiscounts();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCode()).isEqualTo("RELOJES10");
        }

        @Test
        @DisplayName("getActiveDiscounts devuelve solo los válidos")
        void getActiveReturnsOnlyValid() {
            when(discountRepository.findAllActive()).thenReturn(List.of(validDiscount));

            List<DiscountResponse> result = discountService.getActiveDiscounts();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).isActive()).isTrue();
        }

        @Test
        @DisplayName("toggleActive invierte el estado activo")
        void toggleFlipsActiveState() {
            when(discountRepository.findById(1)).thenReturn(Optional.of(validDiscount));
            when(discountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            DiscountResponse resp = discountService.toggleActive(1);

            assertThat(resp.isActive()).isFalse(); // era true, ahora false
        }

        @Test
        @DisplayName("findValidByCode devuelve empty si el cupón es inválido")
        void findValidByCodeReturnsEmptyForInvalid() {
            validDiscount.setActive(false);
            when(discountRepository.findByCode("RELOJES10")).thenReturn(Optional.of(validDiscount));

            Optional<Discount> result = discountService.findValidByCode("RELOJES10");

            assertThat(result).isEmpty();
        }
    }

    private DiscountRequest buildRequest(String code, String name,
                                          BigDecimal pct, boolean active) {
        DiscountRequest r = new DiscountRequest();
        r.setCode(code);
        r.setName(name);
        r.setPercentage(pct);
        r.setActive(active);
        r.setStartsAt(LocalDateTime.now().minusDays(1));
        r.setEndsAt(LocalDateTime.now().plusDays(30));
        return r;
    }
}

package com.uade.tpo.demo.purchaseservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.ApplyDiscountResponse;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountRequest;
import com.uade.tpo.demo.purchaseservice.dto.discount.DiscountResponse;
import com.uade.tpo.demo.purchaseservice.service.DiscountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DiscountController.class)
@DisplayName("DiscountController — endpoints REST")
class DiscountControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean DiscountService discountService;

    private DiscountResponse sampleDiscount;

    @BeforeEach
    void setUp() {
        sampleDiscount = DiscountResponse.builder()
            .id(1).code("RELOJES10").name("10% bienvenida")
            .percentage(new BigDecimal("10.00"))
            .startsAt(LocalDateTime.now().minusDays(1))
            .endsAt(LocalDateTime.now().plusDays(30))
            .active(true)
            .createdAt(LocalDateTime.now().minusDays(1))
            .build();
    }

    // ──────────────────────────────────────────────────
    // POST /api/v1/discounts
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/discounts")
    class Create {

        @Test
        @DisplayName("201 Created con el cupón nuevo")
        void returns201OnCreate() throws Exception {
            when(discountService.createDiscount(any())).thenReturn(sampleDiscount);

            DiscountRequest req = new DiscountRequest();
            req.setCode("RELOJES10");
            req.setName("10% bienvenida");
            req.setPercentage(new BigDecimal("10.00"));
            req.setActive(true);

            mockMvc.perform(post("/api/v1/discounts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("RELOJES10"))
                .andExpect(jsonPath("$.percentage").value(10.00))
                .andExpect(jsonPath("$.active").value(true));
        }

        @Test
        @DisplayName("400 si el código ya existe")
        void returns400WhenCodeDuplicated() throws Exception {
            when(discountService.createDiscount(any()))
                .thenThrow(new IllegalArgumentException("Código ya existe"));

            DiscountRequest req = new DiscountRequest();
            req.setCode("RELOJES10");
            req.setName("dup");
            req.setPercentage(new BigDecimal("10"));
            req.setActive(true);

            mockMvc.perform(post("/api/v1/discounts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/discounts
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/discounts")
    class GetAll {

        @Test
        @DisplayName("200 con lista de todos los cupones")
        void returns200WithList() throws Exception {
            when(discountService.getAllDiscounts()).thenReturn(List.of(sampleDiscount));

            mockMvc.perform(get("/api/v1/discounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].code").value("RELOJES10"));
        }

        @Test
        @DisplayName("200 con lista vacía si no hay cupones")
        void returns200WithEmptyList() throws Exception {
            when(discountService.getAllDiscounts()).thenReturn(List.of());

            mockMvc.perform(get("/api/v1/discounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/discounts/active
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/discounts/active")
    class GetActive {

        @Test
        @DisplayName("200 con solo los cupones activos y vigentes")
        void returns200WithActiveOnly() throws Exception {
            when(discountService.getActiveDiscounts()).thenReturn(List.of(sampleDiscount));

            mockMvc.perform(get("/api/v1/discounts/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].active").value(true));
        }
    }

    // ──────────────────────────────────────────────────
    // GET /api/v1/discounts/{id}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/v1/discounts/{id}")
    class GetById {

        @Test
        @DisplayName("200 con el cupón")
        void returns200() throws Exception {
            when(discountService.getById(1)).thenReturn(Optional.of(sampleDiscount));

            mockMvc.perform(get("/api/v1/discounts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.code").value("RELOJES10"));
        }

        @Test
        @DisplayName("404 si el cupón no existe")
        void returns404WhenNotFound() throws Exception {
            when(discountService.getById(99)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/discounts/99"))
                .andExpect(status().isNotFound());
        }
    }

    // ──────────────────────────────────────────────────
    // POST /api/v1/discounts/apply?subtotal=X
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/v1/discounts/apply")
    class Apply {

        @Test
        @DisplayName("200 con el resultado del descuento aplicado")
        void returns200WithDiscountResult() throws Exception {
            ApplyDiscountResponse applyResp = ApplyDiscountResponse.builder()
                .code("RELOJES10").name("10% bienvenida")
                .percentage(new BigDecimal("10.00"))
                .discountAmount(new BigDecimal("100.00"))
                .originalSubtotal(new BigDecimal("1000.00"))
                .finalSubtotal(new BigDecimal("900.00"))
                .build();

            when(discountService.applyDiscount(any(), any())).thenReturn(applyResp);

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("RELOJES10");

            mockMvc.perform(post("/api/v1/discounts/apply")
                    .param("subtotal", "1000.00")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.discountAmount").value(100.00))
                .andExpect(jsonPath("$.finalSubtotal").value(900.00))
                .andExpect(jsonPath("$.originalSubtotal").value(1000.00));
        }

        @Test
        @DisplayName("400 si el código es inválido o vencido")
        void returns400WhenCodeInvalid() throws Exception {
            when(discountService.applyDiscount(any(), any()))
                .thenThrow(new IllegalStateException("Cupón vencido"));

            ApplyDiscountRequest req = new ApplyDiscountRequest();
            req.setCode("EXPIRED");

            mockMvc.perform(post("/api/v1/discounts/apply")
                    .param("subtotal", "500.00")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
        }
    }

    // ──────────────────────────────────────────────────
    // PATCH /api/v1/discounts/{id}/toggle
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("PATCH /api/v1/discounts/{id}/toggle")
    class Toggle {

        @Test
        @DisplayName("200 con el estado invertido")
        void returns200WithToggledState() throws Exception {
            DiscountResponse toggled = DiscountResponse.builder()
                .id(1).code("RELOJES10").name("10% bienvenida")
                .percentage(new BigDecimal("10.00")).active(false)
                .createdAt(LocalDateTime.now()).build();

            when(discountService.toggleActive(1)).thenReturn(toggled);

            mockMvc.perform(patch("/api/v1/discounts/1/toggle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
        }

        @Test
        @DisplayName("404 si el cupón no existe")
        void returns404WhenNotFound() throws Exception {
            when(discountService.toggleActive(99))
                .thenThrow(new IllegalArgumentException("not found"));

            mockMvc.perform(patch("/api/v1/discounts/99/toggle"))
                .andExpect(status().isNotFound());
        }
    }

    // ──────────────────────────────────────────────────
    // DELETE /api/v1/discounts/{id}
    // ──────────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /api/v1/discounts/{id}")
    class Delete {

        @Test
        @DisplayName("204 No Content al eliminar cupón")
        void returns204() throws Exception {
            doNothing().when(discountService).deleteDiscount(1);

            mockMvc.perform(delete("/api/v1/discounts/1"))
                .andExpect(status().isNoContent());
        }
    }
}

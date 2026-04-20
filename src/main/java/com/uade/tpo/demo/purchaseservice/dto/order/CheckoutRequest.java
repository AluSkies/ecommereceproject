package com.uade.tpo.demo.purchaseservice.dto.order;

import lombok.Data;

@Data
public class CheckoutRequest {
    private Integer cartId;
    private Integer customerId;
    private String discountCode;

    // Datos de envío
    private String firstName;
    private String lastName;
    private String phone;
    private String line1;
    private String line2;
    private String city;
    private String region;
    private String postalCode;
    private String countryCode;
}

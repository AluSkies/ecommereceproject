package com.uade.tpo.demo.catalogservice.discount.domain;

/**
 * Enum representing the status of a discount
 */
public enum DiscountStatus {
    ACTIVE,      // Currently active and being applied
    INACTIVE,    // Inactive, not being applied
    EXPIRED,     // Validity period has ended
    SCHEDULED    // Scheduled for future activation
}

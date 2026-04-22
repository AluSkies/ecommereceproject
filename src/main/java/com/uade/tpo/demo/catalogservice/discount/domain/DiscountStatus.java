package com.uade.tpo.demo.catalogservice.discount.domain;

/**
 * Enum representing the lifecycle status of a discount.
 *
 * <p>Matches the {@code discounts.status} column values declared in
 * {@code schema.sql}.</p>
 */
public enum DiscountStatus {
    ACTIVE,    // Currently active and applicable within its validity window
    EXPIRED,   // Validity period has ended or admin marked as expired
    DISABLED   // Administratively disabled; not applicable even if within validity
}

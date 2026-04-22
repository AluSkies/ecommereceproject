package com.uade.tpo.demo.catalogservice.discount.domain;

/**
 * Enum representing the type of a discount.
 *
 * <ul>
 *   <li>{@link #PERCENTAGE} — discount value is a percentage applied to the subtotal.</li>
 *   <li>{@link #FIXED} — discount value is a flat amount subtracted from the subtotal
 *       (capped by the subtotal itself so it can never produce a negative total).</li>
 * </ul>
 */
public enum DiscountType {
    PERCENTAGE,
    FIXED
}

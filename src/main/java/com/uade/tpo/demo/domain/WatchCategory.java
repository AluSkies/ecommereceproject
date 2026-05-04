package com.uade.tpo.demo.domain;

/**
 * Backwards-compatible API category enum.
 *
 * <p>Source of truth for persistence is {@code entity.Category.code};
 * this enum is kept to preserve existing request/response contracts while
 * ProductService maps between both representations.</p>
 */
public enum WatchCategory {
    LUXURY("Luxury"),
    SPORT("Sport"),
    VINTAGE("Vintage"),
    DRESS("Dress");

    private final String displayName;

    WatchCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}


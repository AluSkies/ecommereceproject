package com.uade.tpo.demo.catalogservice.domain;

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

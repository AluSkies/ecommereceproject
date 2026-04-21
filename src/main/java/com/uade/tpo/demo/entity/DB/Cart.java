package com.uade.tpo.demo.entity.DB;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relacion con el cliente, un cliente puede tener varios carritos 
    // (ej: carrito activo, carritos anteriores convertidos en ordenes, carritos abandonados)
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private CustomerInfo customer;

    private String status; // activo, convertidos, abandonado

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // relacion con items del carrito, un carrito puede tener varios items, 
    // pero cada item pertenece a un solo carrito
    @OneToMany(mappedBy = "cart")
    private List<CartItem> items;

    public Long getId() {
    return id;
}   

// antes de persistir o actualizar el carrito, seteamos las fechas
@PrePersist
public void prePersist() {
    this.createdAt = java.time.LocalDateTime.now();
    this.updatedAt = java.time.LocalDateTime.now();
}

@PreUpdate
public void preUpdate() {
    this.updatedAt = java.time.LocalDateTime.now();
}








// getters y setters
public CustomerInfo getCustomer() {
    return customer;
}

public void setCustomer(CustomerInfo customer) {
    this.customer = customer;
}

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

public LocalDateTime getExpiresAt() {
    return expiresAt;
}

public void setExpiresAt(LocalDateTime expiresAt) {
    this.expiresAt = expiresAt;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

public LocalDateTime getUpdatedAt() {
    return updatedAt;
}

public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
}

public List<CartItem> getItems() {
    return items;
}

public void setItems(List<CartItem> items) {
    this.items = items;
}
}
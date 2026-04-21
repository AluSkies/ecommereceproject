package com.uade.tpo.demo.entity.DB;

import jakarta.persistence.*;

@Entity
@Table(
    name = "wishlist_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "product_id"})
)
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // con el customer :id y product_id hacemos que un mismo producto no pueda estar 2 veces en la wishlist de un mismo cliente
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private CustomerInfo customer;

    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
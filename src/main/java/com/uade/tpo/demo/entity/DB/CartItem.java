package com.uade.tpo.demo.entity.DB;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // 🔥 IMPORT

@Entity
@Table(
    name = "cart_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"cart_id", "product_id"})
)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;

    private Double priceAtTime;

    // relacion con el carrito, un item pertenece a un solo carrito, pero un carrito puede tener varios items
    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonIgnore         // nos evita la serialización del carrito para prevenir ciclos infinitos
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    // getters y setters
    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPriceAtTime() {
        return priceAtTime;
    }

    public void setPriceAtTime(Double priceAtTime) {
        this.priceAtTime = priceAtTime;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }
}
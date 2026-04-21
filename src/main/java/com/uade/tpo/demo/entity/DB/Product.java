package com.uade.tpo.demo.entity.DB;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String category;
    private String brand;
    private Double price;
    private String status;
    private Integer stockQuantity;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

     //relación con ProductImage 1 a N
    @OneToMany(mappedBy = "product")
    private List<ProductImage> images;

    // getters y setters
    public Double getPrice() {
    return price;
    }

    public Integer getStockQuantity() {
    return stockQuantity;
}

}

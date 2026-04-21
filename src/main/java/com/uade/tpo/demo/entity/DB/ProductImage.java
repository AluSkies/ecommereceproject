package com.uade.tpo.demo.entity.DB;

import jakarta.persistence.*;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;
    private Integer sortOrder;
    private String altText;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
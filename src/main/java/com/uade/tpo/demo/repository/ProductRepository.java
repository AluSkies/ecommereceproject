package com.uade.tpo.demo.repository;


import com.uade.tpo.demo.entity.DB.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
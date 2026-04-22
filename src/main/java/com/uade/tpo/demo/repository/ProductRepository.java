package com.uade.tpo.demo.repository;

import com.uade.tpo.demo.catalogservice.domain.ProductStatus;
import com.uade.tpo.demo.catalogservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findBySku(String sku);

    List<Product> findByStatus(ProductStatus status);

    List<Product> findByCategory_Code(String categoryCode);

    List<Product> findByBrandId(Long brandId);

    List<Product> findByNameContainingIgnoreCase(String fragment);

    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :min AND :max")
    List<Product> findByPriceRange(@Param("min") BigDecimal min, @Param("max") BigDecimal max);

    @Query("SELECT p FROM Product p WHERE p.stock > 0 AND p.stock <= :threshold")
    List<Product> findLowStock(@Param("threshold") int threshold);

    @Query("SELECT p FROM Product p WHERE p.stock <= 0")
    List<Product> findOutOfStock();

    boolean existsBySku(String sku);
}

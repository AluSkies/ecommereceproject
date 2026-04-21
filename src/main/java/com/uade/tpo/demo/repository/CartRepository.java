package com.uade.tpo.demo.repository;


import com.uade.tpo.demo.entity.DB.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByCustomer_IdAndStatus(Long customerId, String status);
}
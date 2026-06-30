package com.uade.tpo.demo.repository;

import com.uade.tpo.demo.domain.OrderStatus;
import com.uade.tpo.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA repository for Order aggregates.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserId(Long userId);

    List<Order> findByStatus(OrderStatus status);
}

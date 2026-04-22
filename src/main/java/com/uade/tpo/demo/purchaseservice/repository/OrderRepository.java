package com.uade.tpo.demo.purchaseservice.repository;

import com.uade.tpo.demo.purchaseservice.domain.OrderStatus;
import com.uade.tpo.demo.purchaseservice.entity.Order;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class OrderRepository {

    private final List<Order> orders = new ArrayList<>();
    private Integer nextId = 1;

    public Order save(Order order) {
        if (order.getId() == null) {
            order.setId(nextId++);
            orders.add(order);
        } else {
            int index = -1;
            for (int i = 0; i < orders.size(); i++) {
                if (orders.get(i).getId().equals(order.getId())) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) orders.set(index, order);
        }
        return order;
    }

    public Optional<Order> findById(Integer id) {
        return orders.stream().filter(o -> o.getId().equals(id)).findFirst();
    }

    public Optional<Order> findByOrderNumber(String orderNumber) {
        return orders.stream()
            .filter(o -> o.getOrderNumber().equals(orderNumber))
            .findFirst();
    }

    public List<Order> findByCustomerId(Integer customerId) {
        return orders.stream()
            .filter(o -> customerId.equals(o.getCustomerId()))
            .collect(Collectors.toList());
    }

    public List<Order> findByStatus(OrderStatus status) {
        return orders.stream()
            .filter(o -> status.equals(o.getStatus()))
            .collect(Collectors.toList());
    }

    public List<Order> findAll() {
        return new ArrayList<>(orders);
    }
}

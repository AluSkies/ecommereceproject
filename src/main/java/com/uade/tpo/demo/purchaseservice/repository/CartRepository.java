package com.uade.tpo.demo.purchaseservice.repository;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class CartRepository {

    private final List<Cart> carts = new ArrayList<>();
    private Integer nextId = 1;

    public Cart save(Cart cart) {
        if (cart.getId() == null) {
            cart.setId(nextId++);
            carts.add(cart);
        } else {
            int index = -1;
            for (int i = 0; i < carts.size(); i++) {
                if (carts.get(i).getId().equals(cart.getId())) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) carts.set(index, cart);
        }
        return cart;
    }

    public Optional<Cart> findById(Integer id) {
        return carts.stream().filter(c -> c.getId().equals(id)).findFirst();
    }

    public Optional<Cart> findActiveByCustomerId(Integer customerId) {
        return carts.stream()
            .filter(c -> customerId.equals(c.getCustomerId())
                && CartStatus.ACTIVE.equals(c.getStatus()))
            .findFirst();
    }

    public Optional<Cart> findActiveByGuestToken(String guestToken) {
        return carts.stream()
            .filter(c -> guestToken.equals(c.getGuestToken())
                && CartStatus.ACTIVE.equals(c.getStatus()))
            .findFirst();
    }

    public List<Cart> findByCustomerId(Integer customerId) {
        return carts.stream()
            .filter(c -> customerId.equals(c.getCustomerId()))
            .collect(Collectors.toList());
    }

    public void expireOldCarts() {
        carts.stream()
            .filter(c -> CartStatus.ACTIVE.equals(c.getStatus())
                && c.getExpiresAt() != null
                && c.getExpiresAt().isBefore(LocalDateTime.now()))
            .forEach(c -> c.setStatus(CartStatus.ABANDONED));
    }
}

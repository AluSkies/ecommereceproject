package com.uade.tpo.demo.purchaseservice.repository;

import com.uade.tpo.demo.purchaseservice.domain.CartStatus;
import com.uade.tpo.demo.purchaseservice.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA repository for Cart.
 * Exposes lookups for the "first active cart for a user/guest" pattern used by
 * {@link com.uade.tpo.demo.purchaseservice.service.CartService}. The schema
 * keeps (user_id, status) as a non-unique index, so application code is
 * responsible for enforcing "one ACTIVE cart per user" — these finders return
 * the first match if multiple ever exist.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findFirstByUserIdAndStatus(Long userId, CartStatus status);

    Optional<Cart> findFirstByGuestTokenAndStatus(String guestToken, CartStatus status);

    List<Cart> findByUserId(Long userId);
}

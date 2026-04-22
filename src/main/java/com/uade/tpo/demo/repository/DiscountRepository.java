package com.uade.tpo.demo.repository;

import com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus;
import com.uade.tpo.demo.catalogservice.discount.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Integer> {

    Optional<Discount> findByCode(String code);

    List<Discount> findByStatus(DiscountStatus status);

    @Query("SELECT d FROM Discount d WHERE d.status = com.uade.tpo.demo.catalogservice.discount.domain.DiscountStatus.ACTIVE "
        + "AND d.validFrom <= :now AND d.validUntil >= :now")
    List<Discount> findActiveAndValid(@Param("now") LocalDateTime now);

    @Query("SELECT d FROM Discount d WHERE d.validUntil < :now")
    List<Discount> findExpired(@Param("now") LocalDateTime now);

    @Query("SELECT d FROM Discount d WHERE d.validFrom > :now")
    List<Discount> findScheduled(@Param("now") LocalDateTime now);

    boolean existsByCode(String code);
}

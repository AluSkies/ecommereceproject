package com.uade.tpo.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.demo.entity.CustomersInfo;

public interface CustomersInfoRepository extends JpaRepository<CustomersInfo, Long> {

    Optional<CustomersInfo> findByUser_UserId(Long userId);

    Optional<CustomersInfo> findByUser_Username(String username);

    boolean existsByUser_UserId(Long userId);
}

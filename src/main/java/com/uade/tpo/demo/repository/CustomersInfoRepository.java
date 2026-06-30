package com.uade.tpo.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.demo.entity.CustomersInfo;

public interface CustomersInfoRepository extends JpaRepository<CustomersInfo, Long> {

    Optional<CustomersInfo> findByUser_Id(Long id);

    Optional<CustomersInfo> findByUser_Email(String email);

    boolean existsByUser_Id(Long id);
}

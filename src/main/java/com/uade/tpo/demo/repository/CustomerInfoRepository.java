package com.uade.tpo.demo.repository;


import com.uade.tpo.demo.entity.DB.CustomerInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerInfoRepository extends JpaRepository<CustomerInfo, Long> {
}
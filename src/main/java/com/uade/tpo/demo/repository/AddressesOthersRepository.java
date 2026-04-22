package com.uade.tpo.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.demo.entity.AddressesOthers;

public interface AddressesOthersRepository extends JpaRepository<AddressesOthers, Long> {

    List<AddressesOthers> findByCustomer_Id(Long customerId);

    List<AddressesOthers> findByCustomer_User_Email(String email);
}

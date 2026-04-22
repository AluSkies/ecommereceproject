package com.uade.tpo.demo.entity.dto;

import java.util.Date;

import com.uade.tpo.demo.entity.enums.Role;

import lombok.Data;

@Data
public class UserResponse {

    private Long id;

    // USER
    private String email;
    private Role role;
    private Boolean emailVerified;
    private Boolean isActive;
    private Date createdAt;
    private Date updatedAt;

    // CUSTOMER INFO
    private String firstName;
    private String lastName;
    private String phone;

    // DIRECCIÓN
    private String line1;
    private String line2;
    private String city;
    private String region;
    private String postalCode;
    private String countryCode;
}
package com.uade.tpo.demo.entity.dto;

import java.util.Date;

import com.uade.tpo.demo.entity.enums.Role;

import lombok.Data;

@Data
public class UserResponse {
    private Long idUser;
    private String username;
    private String email;
    private String name;
    private String lastName;
    private Role role;
    private Date registrationDate;
}

package com.uade.tpo.demo.entity.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String username;
    private String email;
    private String name;
    private String lastName;
}

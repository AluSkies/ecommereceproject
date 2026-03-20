package com.uade.tpo.demo.entity;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class Person {
    private int id;
    private String nombre;
    private String email;
    
    public Person(int id, String nombre, String email) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
    }
}

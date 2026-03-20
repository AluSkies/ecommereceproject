package com.uade.tpo.demo.entity;

import lombok.Builder;
import lombok.Data;

@Data
@Builder


public class Store {
    private String nombre;
    private String direccion;
    private String estado;

    public Store() {
    }

    public Store(String nombre, String direccion, String estado) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.estado = estado;
    }
}



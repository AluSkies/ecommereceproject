package com.uade.tpo.demo.repository;
import com.uade.tpo.demo.entity.Store;


public class StoreRepository {
    public Store getStoreInfo() {
        return new Store("Tienda de ropa", "Buenos Aires", "Abierta");
    }
}
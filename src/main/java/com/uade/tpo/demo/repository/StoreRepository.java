package com.uade.tpo.demo.repository;
import com.uade.tpo.demo.entity.Store;


public class StoreRepository {
    private Store storeInfo = new Store("Tienda de ropa", "Buenos Aires", "Abierta");

    public Store getStoreInfo() {
        return storeInfo;
    }

    public Store updateStoreInfo(Store newStoreInfo) {
        this.storeInfo = newStoreInfo;
        return this.storeInfo;
    }
}
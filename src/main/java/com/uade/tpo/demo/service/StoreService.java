package com.uade.tpo.demo.service;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.Store;
import com.uade.tpo.demo.repository.StoreRepository;

@Service
public class StoreService {
    
    private StoreRepository storeRepository = new StoreRepository();

    public Store getStoreInfo() {
    return storeRepository.getStoreInfo();
}

    public Store updateStoreInfo(Store storeInfo) {
        return storeRepository.updateStoreInfo(storeInfo);
    }
}

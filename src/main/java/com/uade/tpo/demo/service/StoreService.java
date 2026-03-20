package com.uade.tpo.demo.service;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.Store;
import com.uade.tpo.demo.repository.StoreRepository;
import lombok.Builder;
import lombok.Data;

@Service
public class StoreService {
    
    private StoreRepository storeRepository = new StoreRepository();

    public Store getStoreInfo() {
    return storeRepository.getStoreInfo();
}
}

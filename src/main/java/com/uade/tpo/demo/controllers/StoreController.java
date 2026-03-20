package com.uade.tpo.demo.controllers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.uade.tpo.demo.service.StoreService;
import com.uade.tpo.demo.entity.Store;  
import lombok.Builder;
import lombok.Data;


@Data@Builder

@RestController
@RequestMapping("/store")


public class StoreController {
    private StoreService storeService = new StoreService();

    @GetMapping("/info") 
    public Store getStoreInfo() {
        return storeService.getStoreInfo();
    }

    @PutMapping("/info")
    public Store updateStoreInfo(@RequestBody Store storeInfo) {
        return storeService.updateStoreInfo(storeInfo);
    }
}

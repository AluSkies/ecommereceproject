package com.uade.tpo.demo.controllers;
import com.uade.tpo.demo.entity.DB.Cart;
import com.uade.tpo.demo.service.CartService;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.uade.tpo.demo.entity.DB.Order;
import java.util.Map;
import java.util.HashMap;




@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;


@GetMapping
public Map<String, Object> getCart(@RequestParam Long customerId) {

    Cart cart = cartService.getOrCreateCart(customerId);

    Double total = cartService.calculateTotal(cart);

    Map<String, Object> response = new HashMap<>();
    response.put("cart", cart);
    response.put("total", total);

    return response;
}
    @PostMapping("/add")
    public Cart addProduct(
            @RequestParam Long customerId,
            @RequestParam Long productId,
            @RequestParam int quantity
    ) {
        return cartService.addProduct(customerId, productId, quantity);
    }

    @PostMapping("/checkout")
    public Order checkout(@RequestParam Long customerId) {
        return cartService.checkout(customerId);
    }

    @PutMapping("/update")
    public Cart updateQuantity(
            @RequestParam Long customerId,
            @RequestParam Long productId,
            @RequestParam int quantity
    ) {
        return cartService.updateQuantity(customerId, productId, quantity);
    }
}
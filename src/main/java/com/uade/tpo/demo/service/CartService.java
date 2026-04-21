package com.uade.tpo.demo.service;

import com.uade.tpo.demo.entity.DB.*;
import com.uade.tpo.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CustomerInfoRepository customerInfoRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    // Obtener o crear carrito activo para un cliente
    public Cart getOrCreateCart(Long customerId) {

    return cartRepository
            .findByCustomer_IdAndStatus(customerId, "active")
            .orElseGet(() -> {
                Cart cart = new Cart();
                cart.setStatus("active");

                CustomerInfo customer = customerInfoRepository.findById(customerId)
                        .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

                cart.setCustomer(customer);

                return cartRepository.save(cart);
            });
}

    // agregar un prodcuto al carrito, si el producto ya existe en el carrito se actualiza la cantidad, 
    // sino se crea un nuevo item
    public Cart addProduct(Long customerId, Long productId, int quantity) {

        Cart cart = getOrCreateCart(customerId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        CartItem item = cartItemRepository
                .findByCart_IdAndProduct_Id(cart.getId(), productId)
                .orElse(null);

        if (item != null) {
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setPriceAtTime(product.getPrice());
        }

        cartItemRepository.save(item);
        return cart;
        
    }

    
    
    
    
    public Order checkout(Long customerId) {

    Cart cart = getOrCreateCart(customerId);

    if (cart.getItems() == null || cart.getItems().isEmpty()) {
        throw new RuntimeException("El carrito está vacío");
    }

    CustomerInfo customer = customerInfoRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

    Order order = new Order();
    order.setCustomer(customer);
    order.setStatus("CREATED");

    order = orderRepository.save(order);

    double total = 0;

    for (CartItem item : cart.getItems()) {

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProduct(item.getProduct());
        orderItem.setQuantity(item.getQuantity());
        orderItem.setPrice(item.getPriceAtTime());

        orderItemRepository.save(orderItem);

        total += item.getPriceAtTime() * item.getQuantity();
    }

    order.setGrandTotal(total);
    orderRepository.save(order);

    cart.setStatus("converted");
    cartRepository.save(cart);

    return order;
    }



// chequear que la cantidad sea positiva, que el producto exista, 
// que el producto esté en el carrito, si la cantidad es 0 eliminar el item, 
// sino actualizar la cantidad
public Cart updateQuantity(Long customerId, Long productId, int quantity) {

    if (quantity < 0) {
        throw new RuntimeException("Cantidad inválida");
    }

    Cart cart = getOrCreateCart(customerId);

    CartItem item = cartItemRepository
            .findByCart_IdAndProduct_Id(cart.getId(), productId)
            .orElseThrow(() -> new RuntimeException("Producto no está en el carrito"));

    // si mandan 0 → eliminar producto
    if (quantity == 0) {
        cartItemRepository.delete(item);
        return cart;
    }

    Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

    if (product.getStockQuantity() < quantity) {
        throw new RuntimeException("Stock insuficiente");
    }

    item.setQuantity(quantity);
    cartItemRepository.save(item);

    return cart;
}
public Double calculateTotal(Cart cart) {

    if (cart.getItems() == null) return 0.0;

    double total = 0;

    for (CartItem item : cart.getItems()) {
        total += item.getPriceAtTime() * item.getQuantity();
    }

    return total;
}
}














    

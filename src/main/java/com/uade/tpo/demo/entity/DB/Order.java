package com.uade.tpo.demo.entity.DB;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String orderNumber;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private CustomerInfo customer;

    private String status;

    private Double subtotal;
    private Double discountTotal;
    private Double shippingTotal;
    private Double taxTotal;
    private Double grandTotal;

    private String currency;

    @Column(columnDefinition = "TEXT")
    private String shippingSnapshot;

    private LocalDateTime placedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // relación con el historial
    @OneToMany(mappedBy = "order")
    private List<OrderStatusHistory> statusHistory;


    // setters y getters
    public void setCustomer(CustomerInfo customer) {
    this.customer = customer;
}

    public void setStatus(String status) {
    this.status = status;
}

    public void setGrandTotal(Double total) {
    this.grandTotal = total;
}
}
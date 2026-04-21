package com.uade.tpo.demo.entity.DB;
import jakarta.persistence.*;

@Entity
@Table(name = "customer_info")
public class CustomerInfo {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String firstName;
    private String lastName;
    private String phone;

    private String line1;
    private String line2;
    private String city;
    private String region;
    private String postalCode;
    private String countryCode;
}
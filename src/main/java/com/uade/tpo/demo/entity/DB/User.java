package com.uade.tpo.demo.entity.DB;
import jakarta.persistence.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users") // --> si ponemos user puede traer bugs a futuro por palabra reserbada de SQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String role; // custommer o admin

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // RELACIÓN CON AUDIT LOGS
     //@OneToMany(mappedBy = "adminUser")
     //private List<AdminAuditLog> auditLogs;

    // RELACIÓN CON CUSTOMER INFO (1 a 1)
     //@OneToOne(mappedBy = "user")
     //private CustomerInfo customerInfo;

    // ===== GETTERS Y SETTERS =====

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public void setEmailVerifiedAt(LocalDateTime emailVerifiedAt) {
        this.emailVerifiedAt = emailVerifiedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

//    // public List<AdminAuditLog> getAuditLogs() {
//         return auditLogs;
//    // }

//     public void setAuditLogs(List<AdminAuditLog> auditLogs) {
//         this.auditLogs = auditLogs;
//     }

//     public CustomerInfo getCustomerInfo() {
//         return customerInfo;
//     }

//     public void setCustomerInfo(CustomerInfo customerInfo) {
//         this.customerInfo = customerInfo;
//     } 
    
}


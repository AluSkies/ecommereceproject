-- ============================================================================
-- Tempus e-commerce — Full DER schema (MySQL 8, InnoDB, utf8mb4)
-- ============================================================================
-- This file defines the complete Entity-Relationship model for the project,
-- grouped in 5 domains:
--   1) Identidad & administración  : users, sesion_audit_log
--   2) Clientes & métodos de pago  : customers_info, addresses_others
--   3) Catálogo & inventario       : categories, products, product_images
--   4) Carrito & promociones       : carts, cart_items, discounts
--   5) Pedidos & órdenes           : orders, order_items, order_status_history
--
-- PK sizing conventions:
--   * BIGINT AUTO_INCREMENT : users, sesion_audit_log, customers_info,
--                             addresses_others, orders, order_items,
--                             order_status_history.
--   * INT    AUTO_INCREMENT : categories, products, product_images, carts,
--                             cart_items, discounts (matches Integer fields in
--                             the catalog/purchase POJOs so future JPA
--                             migration is trivial).
--
-- Enums are stored as VARCHAR (Hibernate @Enumerated(STRING)) for portability.
-- Money columns use DECIMAL(12,2). Timestamps use MySQL TIMESTAMP defaults.
-- FKs default to ON DELETE RESTRICT; the audit log keeps user_id nullable and
-- uses ON DELETE SET NULL so the trail survives a user removal.
--
-- The file is re-runnable: drops happen first, in reverse topological order.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Drop in reverse topological order (children before parents)
-- ----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS addresses_others;
DROP TABLE IF EXISTS customers_info;
DROP TABLE IF EXISTS sesion_audit_log;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1) Identidad & administración
-- ============================================================================

-- users ----------------------------------------------------------------------
-- Column names follow Spring default physical naming (camelCase -> snake_case)
-- so they align with the User JPA entity (no explicit @Column(name=...)):
--   userId -> user_id, lastName -> last_name, registrationDate -> registration_date
-- role valid values: ADMIN, BUYER
CREATE TABLE users (
    user_id           BIGINT       NOT NULL AUTO_INCREMENT,
    username          VARCHAR(50)  NOT NULL,
    email             VARCHAR(100) NOT NULL,
    password          VARCHAR(255) NOT NULL,
    name              VARCHAR(50)  NOT NULL,
    last_name         VARCHAR(50)  NOT NULL,
    role              VARCHAR(20)  NULL COMMENT 'ADMIN | BUYER',
    registration_date TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sesion_audit_log -----------------------------------------------------------
-- Matches SessionAuditLog @Entity; ON DELETE SET NULL preserves audit history.
-- event_type valid values: LOGIN_SUCCESS, LOGIN_FAILURE, REGISTER,
--                          TOKEN_ISSUED, TOKEN_REFRESH, LOGOUT
CREATE TABLE sesion_audit_log (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    user_id            BIGINT       NULL,
    username_attempted VARCHAR(50)  NULL,
    event_type         VARCHAR(30)  NOT NULL COMMENT 'LOGIN_SUCCESS|LOGIN_FAILURE|REGISTER|TOKEN_ISSUED|TOKEN_REFRESH|LOGOUT',
    ip_address         VARCHAR(45)  NULL,
    user_agent         VARCHAR(255) NULL,
    success            BOOLEAN      NOT NULL,
    details            VARCHAR(500) NULL,
    timestamp          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_user_id    (user_id),
    KEY idx_audit_event_type (event_type),
    KEY idx_audit_timestamp  (timestamp),
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2) Clientes & métodos de pago
-- ============================================================================

-- customers_info -------------------------------------------------------------
-- preferred_shipping_address_id is added AFTER addresses_others is created
-- (circular FK broken via a trailing ALTER TABLE).
CREATE TABLE customers_info (
    id                            BIGINT       NOT NULL AUTO_INCREMENT,
    user_id                       BIGINT       NOT NULL,
    phone                         VARCHAR(30)  NULL,
    document_type                 VARCHAR(10)  NULL COMMENT 'DNI|LC|LE|PASSPORT|CUIT',
    document_number               VARCHAR(50)  NULL,
    birth_date                    DATE         NULL,
    preferred_shipping_address_id BIGINT       NULL,
    created_at                    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_customers_user_id (user_id),
    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- addresses_others -----------------------------------------------------------
CREATE TABLE addresses_others (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    customer_id   BIGINT       NOT NULL,
    label         VARCHAR(50)  NULL,
    street        VARCHAR(150) NOT NULL,
    street_number VARCHAR(20)  NOT NULL,
    apartment     VARCHAR(20)  NULL,
    city          VARCHAR(80)  NOT NULL,
    state         VARCHAR(80)  NOT NULL,
    country       VARCHAR(80)  NOT NULL,
    postal_code   VARCHAR(20)  NOT NULL,
    is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_addresses_customer_id (customer_id),
    CONSTRAINT fk_addresses_customer
        FOREIGN KEY (customer_id) REFERENCES customers_info (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Close the cycle customers_info -> addresses_others -------------------------
ALTER TABLE customers_info
    ADD CONSTRAINT fk_customers_preferred_address
        FOREIGN KEY (preferred_shipping_address_id) REFERENCES addresses_others (id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- 3) Catálogo & inventario
-- ============================================================================

-- categories -----------------------------------------------------------------
-- code valid values: LUXURY | SPORT | VINTAGE | DRESS (WatchCategory enum).
CREATE TABLE categories (
    id          INT          NOT NULL AUTO_INCREMENT,
    code        VARCHAR(30)  NOT NULL COMMENT 'LUXURY|SPORT|VINTAGE|DRESS',
    name        VARCHAR(80)  NOT NULL,
    slug        VARCHAR(80)  NOT NULL,
    description VARCHAR(500) NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_code (code),
    UNIQUE KEY uk_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- products -------------------------------------------------------------------
-- status valid values: ACTIVE | INACTIVE | DISCONTINUED (ProductStatus enum).
CREATE TABLE products (
    id               INT            NOT NULL AUTO_INCREMENT,
    sku              VARCHAR(50)    NOT NULL,
    name             VARCHAR(150)   NOT NULL,
    slug             VARCHAR(150)   NOT NULL,
    description      TEXT           NULL,
    price            DECIMAL(12,2)  NOT NULL,
    compare_at_price DECIMAL(12,2)  NULL,
    stock            INT            NOT NULL DEFAULT 0,
    status           VARCHAR(20)    NOT NULL COMMENT 'ACTIVE|INACTIVE|DISCONTINUED',
    category_id      INT            NOT NULL,
    brand_id         BIGINT         NULL,
    caliber          VARCHAR(80)    NULL,
    case_size        VARCHAR(20)    NULL,
    strap_material   VARCHAR(80)    NULL,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_products_sku  (sku),
    UNIQUE KEY uk_products_slug (slug),
    KEY idx_products_category   (category_id),
    KEY idx_products_status     (status),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- product_images -------------------------------------------------------------
CREATE TABLE product_images (
    id         INT          NOT NULL AUTO_INCREMENT,
    product_id INT          NOT NULL,
    url        VARCHAR(500) NOT NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    alt_text   VARCHAR(255) NULL,
    PRIMARY KEY (id),
    KEY idx_product_images_product (product_id),
    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4) Carrito & promociones
-- ============================================================================

-- discounts ------------------------------------------------------------------
-- discount_type valid values: PERCENTAGE | FIXED
-- status valid values:        ACTIVE | EXPIRED | DISABLED
CREATE TABLE discounts (
    id             INT            NOT NULL AUTO_INCREMENT,
    code           VARCHAR(30)    NOT NULL,
    description    VARCHAR(200)   NULL,
    discount_type  VARCHAR(20)    NOT NULL COMMENT 'PERCENTAGE|FIXED',
    discount_value DECIMAL(12,2)  NOT NULL,
    min_purchase   DECIMAL(12,2)  NULL,
    max_uses       INT            NULL,
    uses_count     INT            NOT NULL DEFAULT 0,
    status         VARCHAR(20)    NOT NULL COMMENT 'ACTIVE|EXPIRED|DISABLED',
    valid_from     DATETIME       NULL,
    valid_until    DATETIME       NULL,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_discounts_code (code),
    KEY idx_discounts_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- carts ----------------------------------------------------------------------
-- status valid values: ACTIVE | ABANDONED | CONVERTED
-- Note: MySQL lacks partial unique indexes, so (user_id, status) is a plain
--       non-unique index. Application logic must enforce "one ACTIVE per user".
CREATE TABLE carts (
    id          INT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NULL,
    guest_token VARCHAR(100) NULL,
    status      VARCHAR(20)  NOT NULL COMMENT 'ACTIVE|ABANDONED|CONVERTED',
    expires_at  DATETIME     NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_carts_user_status   (user_id, status),
    KEY idx_carts_guest_token   (guest_token),
    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- cart_items -----------------------------------------------------------------
CREATE TABLE cart_items (
    id          INT            NOT NULL AUTO_INCREMENT,
    cart_id     INT            NOT NULL,
    product_id  INT            NOT NULL,
    quantity    INT            NOT NULL,
    unit_price  DECIMAL(12,2)  NOT NULL,
    discount_id INT            NULL,
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_cart_items_cart     (cart_id),
    KEY idx_cart_items_product  (product_id),
    KEY idx_cart_items_discount (discount_id),
    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_discount
        FOREIGN KEY (discount_id) REFERENCES discounts (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5) Pedidos & órdenes
-- ============================================================================

-- orders ---------------------------------------------------------------------
-- status valid values: PENDING | PAID | FULFILLING | SHIPPED | DELIVERED |
--                      CANCELLED | REFUNDED
CREATE TABLE orders (
    id                BIGINT         NOT NULL AUTO_INCREMENT,
    order_number      VARCHAR(40)    NOT NULL,
    user_id           BIGINT         NOT NULL,
    status            VARCHAR(30)    NOT NULL COMMENT 'PENDING|PAID|FULFILLING|SHIPPED|DELIVERED|CANCELLED|REFUNDED',
    subtotal          DECIMAL(12,2)  NOT NULL,
    discount_total    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    shipping_total    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax_total         DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    grand_total       DECIMAL(12,2)  NOT NULL,
    currency          VARCHAR(3)     NOT NULL DEFAULT 'ARS',
    shipping_snapshot JSON           NULL,
    placed_at         DATETIME       NULL,
    created_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_order_number (order_number),
    KEY idx_orders_user   (user_id),
    KEY idx_orders_status (status),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- order_items ----------------------------------------------------------------
CREATE TABLE order_items (
    id           BIGINT         NOT NULL AUTO_INCREMENT,
    order_id     BIGINT         NOT NULL,
    product_id   INT            NOT NULL,
    product_name VARCHAR(150)   NOT NULL,
    unit_price   DECIMAL(12,2)  NOT NULL,
    quantity     INT            NOT NULL,
    line_total   DECIMAL(12,2)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_order_items_order   (order_id),
    KEY idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- order_status_history -------------------------------------------------------
CREATE TABLE order_status_history (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    order_id        BIGINT       NOT NULL,
    previous_status VARCHAR(30)  NULL,
    new_status      VARCHAR(30)  NOT NULL,
    changed_by      BIGINT       NULL,
    changed_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note            VARCHAR(500) NULL,
    PRIMARY KEY (id),
    KEY idx_osh_order (order_id),
    KEY idx_osh_user  (changed_by),
    CONSTRAINT fk_osh_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_osh_user
        FOREIGN KEY (changed_by) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

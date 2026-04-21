-- ============================================================================
-- Tempus e-commerce — Seed data for development
-- ============================================================================
-- Passwords are BCrypt-hashed (cost 10). Plaintext kept in README:
--   admin  / admin123
--   buyer1 / buyer123
--
-- Re-runnable: rows are wiped with DELETE (in reverse-FK order) before the
-- INSERTs so the file can be applied repeatedly without constraint errors.
-- TRUNCATE is intentionally avoided because it fails in the presence of FKs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Wipe existing data (reverse-FK order)
-- ----------------------------------------------------------------------------
DELETE FROM order_status_history;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM discounts;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;
-- Break the customers_info <-> addresses_others cycle before deleting rows.
UPDATE customers_info SET preferred_shipping_address_id = NULL;
DELETE FROM addresses_others;
DELETE FROM customers_info;
DELETE FROM sesion_audit_log;
DELETE FROM users;

-- Reset auto-increment counters so the seed IDs below are deterministic.
ALTER TABLE users                 AUTO_INCREMENT = 1;
ALTER TABLE sesion_audit_log      AUTO_INCREMENT = 1;
ALTER TABLE customers_info        AUTO_INCREMENT = 1;
ALTER TABLE addresses_others      AUTO_INCREMENT = 1;
ALTER TABLE categories            AUTO_INCREMENT = 1;
ALTER TABLE products              AUTO_INCREMENT = 1;
ALTER TABLE product_images        AUTO_INCREMENT = 1;
ALTER TABLE discounts             AUTO_INCREMENT = 1;
ALTER TABLE carts                 AUTO_INCREMENT = 1;
ALTER TABLE cart_items            AUTO_INCREMENT = 1;
ALTER TABLE orders                AUTO_INCREMENT = 1;
ALTER TABLE order_items           AUTO_INCREMENT = 1;
ALTER TABLE order_status_history  AUTO_INCREMENT = 1;

-- ============================================================================
-- 1) users  (2 rows)
-- ============================================================================
INSERT INTO users (user_id, username, email, password, name, last_name, role, registration_date) VALUES
    (1, 'admin',  'admin@tempus.local',  '$2b$10$q0wnCefXyKZgl.yxt4FPp.Auk3utp1VzpeuO0WIIRn4uO4f5pIznC', 'Admin', 'Tempus', 'ADMIN', CURRENT_TIMESTAMP),
    (2, 'buyer1', 'buyer1@tempus.local', '$2b$10$uv9Z3ndetq63PV6LxjlZXeur427Y/qW/nvgShEISNBvnw9juGdkJ2', 'Juan',  'Pérez',  'BUYER', CURRENT_TIMESTAMP);

-- ============================================================================
-- 2) customers_info  (1 row, linked to buyer1)
-- ============================================================================
INSERT INTO customers_info (id, user_id, phone, document_type, document_number, birth_date, preferred_shipping_address_id) VALUES
    (1, 2, '+5411 5555-1234', 'DNI', '35111222', '1992-05-18', NULL);

-- ============================================================================
-- 3) addresses_others  (1 row)  + close the cycle on customers_info
-- ============================================================================
INSERT INTO addresses_others (id, customer_id, label, street, street_number, apartment, city, state, country, postal_code, is_default) VALUES
    (1, 1, 'Casa', 'Av. Corrientes', '1234', 'Piso 3 Dpto B', 'CABA', 'CABA', 'Argentina', 'C1043AAZ', TRUE);

UPDATE customers_info SET preferred_shipping_address_id = 1 WHERE id = 1;

-- ============================================================================
-- 4) categories  (4 rows)
-- ============================================================================
INSERT INTO categories (id, code, name, slug, description, active) VALUES
    (1, 'LUXURY',  'Relojes de Lujo',    'lujo',    'Piezas de alta relojería suiza, ediciones limitadas y complicaciones.', TRUE),
    (2, 'SPORT',   'Relojes Deportivos', 'deporte', 'Relojes robustos para deporte, buceo y uso diario intenso.',            TRUE),
    (3, 'VINTAGE', 'Relojes Vintage',    'vintage', 'Modelos clásicos y piezas de colección con historia.',                  TRUE),
    (4, 'DRESS',   'Relojes de Vestir',  'vestir',  'Relojes elegantes y discretos, ideales para ocasiones formales.',       TRUE);

-- ============================================================================
-- 5) products  (6 rows)
-- ============================================================================
INSERT INTO products (id, sku, name, slug, description, price, compare_at_price, stock, status, category_id, brand_id, caliber, case_size, strap_material) VALUES
    (1, 'ROLEX-001',    'Rolex Submariner',            'rolex-submariner',            'Icono de la relojería deportiva, sumergible hasta 300m.',     9500.00, NULL,    5,  'ACTIVE', 1, 1,    'Calibre 3235', '41mm',   'Acero Oystersteel'),
    (2, 'OMEGA-001',    'Omega Speedmaster',           'omega-speedmaster',           'El legendario Moonwatch, cronógrafo manual profesional.',    7200.00, 7800.00, 4,  'ACTIVE', 1, 2,    'Calibre 3861', '42mm',   'Acero inoxidable'),
    (3, 'SEIKO-001',    'Seiko Prospex Diver',         'seiko-prospex-diver',         'Reloj buzo automático con resistencia 200m, ideal deportes.',  450.00, NULL,   20,  'ACTIVE', 2, 3,    'Calibre 4R36', '42.7mm', 'Caucho'),
    (4, 'CASIO-001',    'Casio G-Shock GA-2100',       'casio-g-shock-ga-2100',       'El "CasiOak", resistente, ligero y con diseño octogonal.',     120.00, NULL,   50,  'ACTIVE', 2, 4,    'Módulo 5611',  '45.4mm', 'Resina'),
    (5, 'TISSOT-001',   'Tissot Visodate Vintage',     'tissot-visodate-vintage',     'Reedición vintage con estética de los años 50.',               850.00, 950.00,  3,  'ACTIVE', 3, 5,    'ETA 2836-2',   '40mm',   'Cuero marrón'),
    (6, 'LONGINES-001', 'Longines La Grande Classique','longines-la-grande-classique','Reloj de vestir ultrafino, elegancia atemporal.',             1600.00, NULL,    8,  'ACTIVE', 4, 6,    'L209.2',       '36mm',   'Cuero negro');

-- ============================================================================
-- 6) product_images  (2 per product -> 12 rows)
-- ============================================================================
INSERT INTO product_images (id, product_id, url, sort_order, alt_text) VALUES
    ( 1, 1, '/images/rolex-1.jpg',    1, 'Rolex Submariner - vista frontal'),
    ( 2, 1, '/images/rolex-2.jpg',    2, 'Rolex Submariner - vista lateral'),
    ( 3, 2, '/images/omega-1.jpg',    1, 'Omega Speedmaster - vista frontal'),
    ( 4, 2, '/images/omega-2.jpg',    2, 'Omega Speedmaster - detalle del dial'),
    ( 5, 3, '/images/seiko-1.jpg',    1, 'Seiko Prospex Diver - vista frontal'),
    ( 6, 3, '/images/seiko-2.jpg',    2, 'Seiko Prospex Diver - bisel'),
    ( 7, 4, '/images/casio-1.jpg',    1, 'Casio G-Shock GA-2100 - vista frontal'),
    ( 8, 4, '/images/casio-2.jpg',    2, 'Casio G-Shock GA-2100 - en muñeca'),
    ( 9, 5, '/images/tissot-1.jpg',   1, 'Tissot Visodate - vista frontal'),
    (10, 5, '/images/tissot-2.jpg',   2, 'Tissot Visodate - correa de cuero'),
    (11, 6, '/images/longines-1.jpg', 1, 'Longines La Grande Classique - vista frontal'),
    (12, 6, '/images/longines-2.jpg', 2, 'Longines La Grande Classique - perfil');

-- ============================================================================
-- 7) discounts  (2 rows)
-- ============================================================================
INSERT INTO discounts (id, code, description, discount_type, discount_value, min_purchase, max_uses, uses_count, status, valid_from, valid_until, created_at) VALUES
    (1, 'BIENVENIDA10', 'Descuento 10% para nuevos clientes', 'PERCENTAGE', 10.00,  NULL, 100, 0, 'ACTIVE',  DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), CURRENT_TIMESTAMP),
    (2, 'VERANO2024',   'Promo verano 2024 - USD 500 off',    'FIXED',      500.00, NULL, NULL, 0, 'EXPIRED', '2024-12-01 00:00:00',            '2024-12-31 23:59:59',            CURRENT_TIMESTAMP);

-- ============================================================================
-- 8) orders  (1 historical order for buyer1)
-- ============================================================================
-- Line 1: 1 x OMEGA-001 @ 7200.00 = 7200.00
-- Line 2: 1 x SEIKO-001 @  450.00 =  450.00
-- subtotal        = 7650.00
-- shipping_total  =   80.00
-- grand_total     = 7730.00
INSERT INTO orders (id, order_number, user_id, status, subtotal, discount_total, shipping_total, tax_total, grand_total, currency, shipping_snapshot, placed_at, created_at, updated_at) VALUES
    (1, 'ORD-20260115-0001', 2, 'DELIVERED', 7650.00, 0.00, 80.00, 0.00, 7730.00, 'ARS',
     JSON_OBJECT(
         'label',        'Casa',
         'street',       'Av. Corrientes',
         'streetNumber', '1234',
         'apartment',    'Piso 3 Dpto B',
         'city',         'CABA',
         'state',        'CABA',
         'country',      'Argentina',
         'postalCode',   'C1043AAZ'
     ),
     '2026-01-15 10:30:00', '2026-01-15 10:30:00', '2026-01-18 16:45:00');

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, line_total) VALUES
    (1, 1, 2, 'Omega Speedmaster',    7200.00, 1, 7200.00),
    (2, 1, 3, 'Seiko Prospex Diver',   450.00, 1,  450.00);

-- ============================================================================
-- 9) order_status_history  (3 rows)
-- ============================================================================
INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by, changed_at, note) VALUES
    (1, 1, NULL,      'PENDING',   2, '2026-01-15 10:30:00', 'Orden creada por el cliente.'),
    (2, 1, 'PENDING', 'PAID',      1, '2026-01-15 11:05:00', 'Pago confirmado por pasarela.'),
    (3, 1, 'PAID',    'DELIVERED', 1, '2026-01-18 16:45:00', 'Entregado en domicilio - firma del receptor.');

-- ============================================================================
-- 10) carts / cart_items  -> intentionally empty (carts are transient).
-- ============================================================================

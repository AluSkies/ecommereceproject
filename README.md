# Tempus — API E-commerce de Relojería

API REST desarrollada con Spring Boot 3 y autenticación JWT como trabajo práctico
de la materia UADE. Modela una tienda de relojes ("Tempus") e implementa los
módulos de catálogo de productos, carrito de compras, órdenes, descuentos y
autenticación/autorización basada en roles.

El proyecto incluye además un frontend React independiente (carpeta `frontend/`)
que consume esta API.

---

## Stack

| Tecnología            | Versión                                 |
| --------------------- | --------------------------------------- |
| Backend               | Spring Boot 3.1.11                      |
| Lenguaje              | Java 17                                 |
| Persistencia          | MySQL 8 + Spring Data JPA               |
| Seguridad             | Spring Security + JWT (jjwt 0.12.5)     |
| Build                 | Maven 3.9 (wrapper `./mvnw` incluido)   |
| Utilidades            | Lombok 1.18.38                          |
| Frontend (referencia) | Vite 8 + React + TypeScript (`frontend/`, README aparte) |

---

## Requisitos previos

- **JDK 17** (OpenJDK o Temurin). Verificar con `java -version`.
- **MySQL 8+** corriendo local o accesible por red.
- **Maven 3.9+** — opcional, el proyecto incluye el wrapper `./mvnw`.

---

## Setup local paso a paso

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd ecommereceproject

# 2. Crear la base de datos
mysql -u root -p -e "CREATE DATABASE ecommerce_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Cargar schema y datos seed
mysql -u root -p ecommerce_bd < src/main/resources/schema.sql
mysql -u root -p ecommerce_bd < src/main/resources/data.sql

# 4. Configurar properties
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Editar application.properties y completar:
#   spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_bd
#   spring.datasource.username=<tu_usuario>
#   spring.datasource.password=<tu_password>
#   application.jwt.secret=<ver paso 5>

# 5. Generar un JWT secret seguro (256 bits o más, base64)
openssl rand -base64 64

# 6. Ejecutar la aplicación
./mvnw spring-boot:run
```

La aplicación levanta en `http://localhost:4002`.

Los scripts `schema.sql` y `data.sql` (en `src/main/resources/`) crean el modelo
de datos completo del DER (13 tablas) y siembran usuarios, categorías, productos,
descuentos y una orden histórica de ejemplo. Ambos scripts son idempotentes —
pueden re-ejecutarse para reinicializar la base.

> **Nota sobre `ddl-auto`:** el ejemplo viene con `spring.jpa.hibernate.ddl-auto=update`
> para evitar fricción en desarrollo. Si preferís que JPA valide el schema contra
> las entidades sin tocarlo, cambiar a `validate` después de ejecutar `schema.sql`.

---

## Usuarios seed

Los siguientes usuarios se cargan automáticamente vía `data.sql`:

| Usuario  | Contraseña  | Rol    | Email                   |
| -------- | ----------- | ------ | ----------------------- |
| `admin`  | `admin123`  | ADMIN  | `admin@tempus.local`    |
| `buyer1` | `buyer123`  | BUYER  | `buyer1@tempus.local`   |

Las contraseñas en la base están hasheadas con BCrypt (cost 10). El endpoint
público `POST /api/v1/auth/register` también permite crear usuarios nuevos
(rol `BUYER` por defecto).

---

## Probar la API (ejemplos cURL)

```bash
BASE=http://localhost:4002

# Login (público) — devuelve { token: "..." }
TOKEN=$(curl -s -X POST $BASE/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"buyer1","password":"buyer123"}' | jq -r .token)

# Listar productos (público)
curl $BASE/api/v1/products

# Agregar item al carrito (requiere auth)
curl -X POST $BASE/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":1}'

# Crear producto (requiere ADMIN)
ADMIN_TOKEN=$(curl -s -X POST $BASE/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)

curl -X POST $BASE/api/v1/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sku":"TEST-001","name":"Test Watch","price":100.00,"stock":10,"categoryId":1}'
```

### Endpoints principales

| Método  | Ruta                                  | Auth  | Rol          |
| ------- | ------------------------------------- | ----- | ------------ |
| POST    | `/api/v1/auth/register`               | No    | —            |
| POST    | `/api/v1/auth/login`                  | No    | —            |
| POST    | `/api/v1/auth/logout`                 | Sí    | Autenticado  |
| GET     | `/api/v1/products`                    | No    | —            |
| GET     | `/api/v1/products/{id}`               | No    | —            |
| GET     | `/api/v1/products/search/**`          | No    | —            |
| POST    | `/api/v1/products`                    | Sí    | ADMIN        |
| PUT     | `/api/v1/products/{id}`               | Sí    | ADMIN        |
| PATCH   | `/api/v1/products/{id}/price`         | Sí    | ADMIN        |
| PATCH   | `/api/v1/products/{id}/stock`         | Sí    | ADMIN        |
| PATCH   | `/api/v1/products/{id}/status`        | Sí    | ADMIN        |
| DELETE  | `/api/v1/products/{id}`               | Sí    | ADMIN        |
| GET     | `/api/v1/cart/{cartId}`               | Sí    | Autenticado  |
| POST    | `/api/v1/cart/items`                  | Sí    | Autenticado  |
| PUT     | `/api/v1/cart/{cartId}/items/{prodId}`| Sí    | Autenticado  |
| DELETE  | `/api/v1/cart/{cartId}/items/{prodId}`| Sí    | Autenticado  |
| DELETE  | `/api/v1/cart/{cartId}`               | Sí    | Autenticado  |
| POST    | `/api/v1/orders/checkout`             | Sí    | Autenticado  |
| GET     | `/api/v1/orders`                      | Sí    | Autenticado  |
| GET     | `/api/v1/orders/{id}`                 | Sí    | Autenticado  |
| PATCH   | `/api/v1/orders/{id}/status`          | Sí    | ADMIN        |
| PATCH   | `/api/v1/orders/{id}/cancel`          | Sí    | Autenticado  |
| GET     | `/api/v1/discounts`                   | Sí    | ADMIN        |
| POST    | `/api/v1/discounts`                   | Sí    | ADMIN        |
| PUT     | `/api/v1/discounts/{id}`              | Sí    | ADMIN        |
| DELETE  | `/api/v1/discounts/{id}`              | Sí    | ADMIN        |

---

## Estructura del proyecto

```
src/main/java/com/uade/tpo/demo/
├── DemoApplication.java            # entry point
├── auth/                           # JWT login/register/logout
├── security/                       # SecurityConfig, JwtService, JwtAuthFilter, AuditService
├── entity/                         # JPA entities (User, SessionAuditLog) + DTOs + enums
│   ├── dto/
│   └── enums/                      # Role, AuditEventType
├── catalogservice/                 # productos y descuentos de catálogo
│   ├── controller/
│   ├── service/
│   ├── domain/
│   ├── dto/
│   ├── entity/                     # ojo: actualmente POJO en memoria
│   └── discount/
├── purchaseservice/                # carrito + órdenes + descuentos aplicados
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── domain/
│   ├── dto/
│   ├── entity/                     # ojo: actualmente POJO en memoria
│   └── exception/                  # excepciones en español
├── controllers/                    # controladores auxiliares (categorías, tienda, usuarios)
├── repository/                     # JpaRepository interfaces (User, SessionAuditLog)
├── service/
└── exceptions/
```

---

## Estado actual del módulo de persistencia (importante)

Hoy `User` y `SessionAuditLog` persisten en MySQL vía JPA. Los módulos
`catalogservice` y `purchaseservice` (productos, carritos, órdenes, descuentos)
usan repositorios en memoria — los datos se pierden al reiniciar la aplicación.
El modelo de datos completo está reflejado en el DER del proyecto y queda
listo para la migración futura a repositorios JPA.

Esta es una decisión consciente para poder entregar la capa de seguridad JWT
y la arquitectura de auditoría de sesiones en esta preentrega, quedando el
cableado JPA de catálogo y compras para la iteración siguiente.

---

## DER

Ver `DER.png` en la raíz del repositorio para el diagrama entidad-relación completo.

---

## Troubleshooting

- **`JAVA_HOME` no configurado**
  `export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64`
- **Puerto 4002 ocupado**
  Cambiar `server.port` en `src/main/resources/application.properties`.
- **JWT secret demasiado corto / `key byte array must be at least 256 bits`**
  Regenerar con `openssl rand -base64 64` y pegarlo en `application.jwt.secret`.
- **`ClassNotFound` o falla de compilación**
  Verificar que se está usando JDK 17, no JDK 8 (`java -version`).
- **MySQL `Access denied`**
  Confirmar que el usuario configurado tiene permisos sobre `ecommerce_bd`
  (`GRANT ALL ON ecommerce_bd.* TO '<usuario>'@'localhost';`).

---

## Frontend

El frontend React vive en `/frontend` con su propio README. Requiere Node 20.19+ (vía nvm).

---

## Autores / Licencia

Trabajo práctico UADE. Grupo N°: _____ (completar).

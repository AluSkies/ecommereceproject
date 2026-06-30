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
- **Docker + Docker Compose v2** para correr MySQL (alternativa: MySQL 8+ instalado nativo).
- **Maven 3.9+** — opcional, el proyecto incluye el wrapper `./mvnw`.

---

## Setup local paso a paso

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd ecommereceproject

# 2. Configurar properties
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Editar application.properties y completar (los valores de DB ya matchean el compose):
#   spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_bd
#   spring.datasource.username=administrator
#   spring.datasource.password=admin1234
#   application.jwt.secret=<ver paso 3>

# 3. Generar un JWT secret seguro (256 bits o más, base64)
openssl rand -base64 64

# 4. Levantar MySQL (schema.sql y data.sql se aplican automáticamente la primera vez)
docker compose up -d
# Verificar que quedó healthy:
docker compose ps

# 5. Ejecutar la aplicación
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ./mvnw spring-boot:run
```

La aplicación levanta en `http://localhost:4002`.

El compose define un servicio `mysql` (imagen `mysql:8.0`, contenedor
`tempus-mysql`) con un volumen persistente `tempus-mysql-data`. Los scripts
`schema.sql` y `data.sql` (en `src/main/resources/`) se montan en
`/docker-entrypoint-initdb.d/` y corren **sólo la primera vez** que se crea el
volumen — crean las 13 tablas del DER y siembran usuarios, categorías,
productos, descuentos y una orden histórica de ejemplo.

### Re-seed / reset de la base

```bash
# Re-cargar seed sin perder el volumen (idempotente)
docker exec -i tempus-mysql mysql -u administrator -padmin1234 ecommerce_bd \
  < src/main/resources/data.sql

# Reset total (borra el volumen y vuelve a correr schema + data al arrancar)
docker compose down -v && docker compose up -d
```

### Alternativa sin Docker

Si preferís MySQL instalado nativo:

```bash
mysql -u root -p -e "CREATE DATABASE ecommerce_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p ecommerce_bd < src/main/resources/schema.sql
mysql -u root -p ecommerce_bd < src/main/resources/data.sql
# Ajustar usuario/password en application.properties al que uses.
```

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

---

## Evidencias (capturas) — Seguridad JWT

Para generar evidencias reproducibles desde la terminal (status codes + JSON),
ejecutar el script:

```bash
cd ecommereceproject
./scripts/evidencias-seguridad.sh
```

El script imprime una secuencia pensada para capturar pantallas:
- Registro de usuario BUYER (201)
- Login con JWT (200)
- Endpoint protegido sin token (401/403)
- Endpoint protegido con token (200)
- Endpoint ADMIN con token BUYER (403)

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

## Colección Postman

Para importar el set completo de requests (57 endpoints agrupados en 9 carpetas, con captura automática del JWT al hacer login):

1. Abrir Postman → **Import** → seleccionar `postman/Tempus-API.postman_collection.json`.
2. Ejecutar **Auth > Login Admin** o **Login Buyer**. El script post-response guarda el token en la variable `{{authToken}}` de la colección.
3. El resto de los requests usan `Authorization: Bearer {{authToken}}` automáticamente.

Incluye casos negativos: login con credenciales inválidas (espera 401), create product con token BUYER (espera 403), get cart sin token (espera 403).

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

Trabajo práctico UADE. Grupo N°: 10.

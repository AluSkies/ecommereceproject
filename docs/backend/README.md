# Documentación del Backend — Tempus API

Guía técnica para el equipo del TP. Acá está todo lo que necesitás saber para
entender el backend, arrancarlo localmente, y contribuir sin romper nada.

> Esta documentación es complementaria al `README.md` de la raíz del repo
> (que es la guía de instalación para el profesor) y al PDF de entrega
> (que es el resumen ejecutivo). Acá profundizamos en la arquitectura.

---

## Índice

- [1. Qué es Tempus](#1-qué-es-tempus)
- [2. Stack técnico](#2-stack-técnico)
- [3. Arquitectura de capas](#3-arquitectura-de-capas)
- [4. Security Filter Chain](#4-security-filter-chain)
- [5. Mapa de paquetes](#5-mapa-de-paquetes)
- [6. Setup local paso a paso](#6-setup-local-paso-a-paso)
- [7. Convenciones de código](#7-convenciones-de-código)
- [8. Flujo de contribución](#8-flujo-de-contribución)
- [9. Cómo correr los tests](#9-cómo-correr-los-tests)
- [10. Documentos relacionados](#10-documentos-relacionados)

---

## 1. Qué es Tempus

API REST de e-commerce de relojería desarrollada como trabajo práctico para la
materia (UADE). Expone las operaciones completas de un catálogo de relojes:
registro/login de usuarios, navegación de productos, gestión de carrito,
checkout con descuentos, seguimiento de órdenes y perfil de cliente con
direcciones de envío. Toda la capa sensible está detrás de JWT con
autorización por roles.

El scope del backend cubre los 5 dominios del DER:

| Dominio | Tablas MySQL | Paquetes Java |
|---|---|---|
| Identidad & administración | `users`, `sesion_audit_log` | `auth`, `security`, `entity` (User, SessionAuditLog) |
| Clientes & métodos de pago | `customers_info`, `addresses_others` | `service.CustomersInfoService`, `service.AddressService` |
| Catálogo & inventario | `categories`, `products`, `product_images` | `catalogservice/*` |
| Carrito & promociones | `carts`, `cart_items`, `discounts` | `purchaseservice/*` (cart), `catalogservice/discount/*` |
| Pedidos & órdenes | `orders`, `order_items`, `order_status_history` | `purchaseservice/*` (order) |

Las 13 entidades del DER están implementadas como `@Entity` JPA con mapeo
correcto a tablas MySQL y relaciones vía `@ManyToOne` / `@OneToMany`.

---

## 2. Stack técnico

| Componente | Versión | Propósito |
|---|---|---|
| Java | 17 | runtime + lenguaje |
| Spring Boot | 3.1.11 | framework base |
| Spring Web | (vía starter) | REST controllers |
| Spring Data JPA | (vía starter) | persistencia |
| Spring Security | (vía starter) | autenticación + autorización |
| Hibernate | (vía JPA starter) | ORM concreto |
| MySQL Connector/J | runtime | driver JDBC |
| MySQL | 8.x | base de datos (en Docker) |
| JJWT | 0.12.5 | generación/validación de JWT |
| Jakarta Validation | (vía starter) | `@Valid`, `@NotBlank`, etc. |
| Lombok | 1.18.38 | boilerplate reduction (`@Data`, `@Builder`, etc.) |
| Maven | 3.9 (wrapper) | build |
| JUnit 5 + Mockito + AssertJ | — | testing |

El build expone el wrapper `./mvnw` así que no hace falta tener Maven
instalado globalmente. Sí es necesario **JDK 17**.

---

## 3. Arquitectura de capas

```
┌─────────────────────────────────────────────────────┐
│  HTTP Request (Postman / curl / frontend React)     │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Controller   (@RestController, @RequestMapping)    │  ← maneja HTTP
│  - valida entrada (@Valid)                          │    y mapea a DTO
│  - delega lógica a Service                          │
│  - traduce excepciones a códigos HTTP               │
│  - aplica @PreAuthorize para autorización           │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Service      (@Service, @Transactional)            │  ← lógica de negocio,
│  - orquesta llamadas a repositorios                 │    reglas del dominio,
│  - aplica reglas de negocio                         │    mapeo DTO ↔ Entity
│  - dispara excepciones de dominio (en español)      │
│  - administra transacciones                         │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Repository   (interface extends JpaRepository)     │  ← persistencia
│  - CRUD automático + queries derivadas              │
│  - queries JPQL custom con @Query                   │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Entity       (@Entity, @Table)                     │  ← mapeo ORM
│  - campos + relaciones JPA                          │    con la BD
│  - helpers de dominio (addItem, isValid, etc.)      │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  MySQL 8 (Docker container tempus-mysql)            │
└─────────────────────────────────────────────────────┘
```

### Reglas inquebrantables

- **El Controller nunca toca el Repository directamente.** Siempre pasa por
  un Service.
- **Las transacciones viven en el Service.** Los servicios llevan
  `@Transactional` a nivel de clase; las lecturas usan
  `@Transactional(readOnly = true)`.
- **Los DTOs nunca llegan a la capa de persistencia.** El service mapea
  Entity ↔ DTO. Nunca retornamos una @Entity serializada directo al cliente
  (se evita el riesgo de exponer campos sensibles o disparar proxies LAZY).
- **Las excepciones de dominio son en español** (ej. `CarritoInactivoException`,
  `ProductoNoEncontradoException`). Las genéricas de Spring/Java quedan como
  están. Hay un `GlobalExceptionHandler` que mapea todas a un
  `ErrorResponse` uniforme con `codigo`, `mensaje`, `timestamp`, `ruta`.

---

## 4. Security Filter Chain

```
Request HTTP
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ JwtAuthFilter (extends OncePerRequestFilter)           │
│ - Lee header "Authorization: Bearer <token>"            │
│ - Si hay token y el contexto está vacío:                │
│     1. extractUsername(token)   (JwtService)            │
│     2. loadUserByUsername()      (UserDetailsService)   │
│     3. isTokenValid()            (JwtService)           │
│     4. SecurityContextHolder.setAuthentication(auth)    │
│ - Si no hay token o es inválido → pasa sin auth         │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ UsernamePasswordAuthenticationFilter                   │
│ (no se usa — sesión STATELESS)                          │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ FilterSecurityInterceptor                              │
│ - Evalúa reglas de authorizeHttpRequests():             │
│   * permitAll: /api/v1/auth/**, GET /products/**,       │
│                GET /api/v1/categories/**, /actuator/... │
│   * authenticated: todo lo demás                        │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ @PreAuthorize en el método del controller              │
│ (si aplica — @EnableMethodSecurity)                     │
│ Ej: hasRole('ADMIN') para endpoints de administración   │
└────────────────────────┬────────────────────────────────┘
                         ▼
                    Controller method
```

### Beans clave (`com.uade.tpo.demo.security`)

- **`JwtService`** — genera y valida tokens HS512 con la librería jjwt 0.12.5.
  Lee `application.jwt.secret` (base64) y `application.jwt.expiration-ms`.
- **`JwtAuthFilter`** — filtro servlet; **ya no está anotado `@Component`**:
  se expone como `@Bean` en `SecurityConfig` para que los tests con
  `@WebMvcTest` no lo auto-escaneen.
- **`SecurityConfig`** — configura la filter chain, CSRF off, sesión
  STATELESS, `@EnableMethodSecurity` para `@PreAuthorize`.
- **`ApplicationConfig`** — declara los beans `PasswordEncoder` (BCrypt),
  `UserDetailsService` (vía `UserRepository.findByUsername`),
  `AuthenticationProvider`, `AuthenticationManager`.
- **`AuditService`** — persiste eventos (`LOGIN_SUCCESS`, `LOGIN_FAILURE`,
  `REGISTER`, `TOKEN_ISSUED`, `LOGOUT`) en `sesion_audit_log` incluyendo IP
  y User-Agent del request. Inyecta `HttpServletRequest` (request-scoped).
  Si falla el guardado, loguea warning pero **nunca** rompe el flujo de
  autenticación.

### Roles soportados

Enum `com.uade.tpo.demo.entity.enums.Role`:

- `ADMIN` — acceso total
- `BUYER` — usuario final (default al registrarse)

Spring Security prefija con `ROLE_` automáticamente, así que
`User.getAuthorities()` devuelve `"ROLE_ADMIN"` o `"ROLE_BUYER"`.

---

## 5. Mapa de paquetes

```
src/main/java/com/uade/tpo/demo/
│
├── DemoApplication.java                    # entry point @SpringBootApplication
│
├── auth/                                   # Módulo de autenticación
│   ├── AuthController.java                 #   POST /api/v1/auth/{register,login,logout}
│   ├── AuthService.java                    #   orquesta AuthenticationManager + JwtService + AuditService
│   └── AuthResponse.java                   #   DTO { token, expiresIn, user }
│
├── security/                               # Beans de seguridad
│   ├── SecurityConfig.java                 #   @EnableWebSecurity, filter chain
│   ├── ApplicationConfig.java              #   PasswordEncoder, UserDetailsService, AuthenticationManager
│   ├── JwtService.java                     #   sign/validate tokens
│   ├── JwtAuthFilter.java                  #   filter que puebla SecurityContextHolder
│   └── AuditService.java                   #   persiste SessionAuditLog
│
├── entity/                                 # Entidades JPA compartidas + DTOs + enums
│   ├── User.java                           #   @Entity implements UserDetails
│   ├── SessionAuditLog.java                #   @Entity de auditoría
│   ├── Category.java                       #   @Entity
│   ├── CustomersInfo.java                  #   @Entity perfil extendido
│   ├── AddressesOthers.java                #   @Entity dirección de envío
│   ├── dto/                                #   Request/Response DTOs (Auth, User, Category, Customer, Address)
│   └── enums/
│       ├── Role.java                       #   ADMIN, BUYER
│       └── AuditEventType.java             #   LOGIN_SUCCESS, ...
│
├── repository/                             # JpaRepositories
│   ├── UserRepository.java
│   ├── SessionAuditLogRepository.java
│   ├── CategoryRepository.java
│   ├── ProductRepository.java
│   ├── DiscountRepository.java
│   ├── CustomersInfoRepository.java
│   └── AddressesOthersRepository.java
│   (+ Person, Store — legacy muerto, no se usa)
│
├── catalogservice/                         # Módulo CATÁLOGO
│   ├── controller/ProductController.java   #   /api/v1/products/**
│   ├── service/ProductService.java
│   ├── entity/Product.java                 #   @Entity
│   ├── entity/ProductImage.java            #   @Entity (relación @ManyToOne a Product)
│   ├── domain/ProductStatus.java           #   ACTIVE, INACTIVE, DISCONTINUED
│   ├── domain/WatchCategory.java           #   LUXURY, SPORT, VINTAGE, DRESS (shortcuts al code de Category)
│   ├── dto/                                #   ProductRequest, ProductResponse
│   └── discount/                           #   Sub-módulo DESCUENTOS
│       ├── controller/DiscountController.java  # /api/v1/discounts/**
│       ├── service/DiscountService.java
│       ├── entity/Discount.java            #   @Entity
│       ├── domain/DiscountStatus.java      #   ACTIVE, EXPIRED, DISABLED
│       ├── domain/DiscountType.java        #   PERCENTAGE, FIXED
│       └── dto/DiscountRequest, DiscountResponse
│
├── purchaseservice/                        # Módulo COMPRAS (carrito + órdenes)
│   ├── controller/
│   │   ├── CartController.java             #   /api/v1/cart/**
│   │   └── OrderController.java            #   /api/v1/orders/**
│   ├── service/
│   │   ├── CartService.java                #   addToCart, updateQty, removeItem, clearCart
│   │   └── OrderService.java               #   checkout, status machine, cancel
│   ├── entity/
│   │   ├── Cart.java                       #   @Entity
│   │   ├── CartItem.java                   #   @Entity
│   │   ├── Order.java                      #   @Entity
│   │   ├── OrderItem.java                  #   @Entity
│   │   └── OrderStatusHistory.java         #   @Entity
│   ├── repository/
│   │   ├── CartRepository.java
│   │   └── OrderRepository.java
│   ├── domain/
│   │   ├── CartStatus.java                 #   ACTIVE, ABANDONED, CONVERTED
│   │   └── OrderStatus.java                #   PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
│   ├── dto/cart/ (Request/Response)
│   ├── dto/order/ (CheckoutRequest, OrderResponse, ...)
│   └── exception/                          #   Excepciones en español + GlobalExceptionHandler
│       ├── GlobalExceptionHandler.java     #   @ControllerAdvice central
│       ├── ErrorResponse.java              #   formato uniforme de error
│       ├── CarritoException.java           #   superclase
│       ├── CarritoNoEncontrado/Inactivo/
│       │   ArticuloNoEncontrado/
│       │   CantidadInvalida/
│       │   SolicitudInvalida/
│       │   ProductoNoEncontrado/
│       │   StockInsuficiente Exception.java
│
├── service/                                # Services transversales (no de dominio puro)
│   ├── UserService.java                    #   interface
│   ├── UserServiceImpl.java                #   CRUD de usuarios, /me
│   ├── CategoryService.java                #   CRUD de categorías
│   ├── CustomersInfoService.java           #   perfil del cliente logueado
│   └── AddressService.java                 #   CRUD de direcciones del cliente
│   (+ PersonService, StoreService — legacy muerto)
│
├── controllers/                            # Controllers sueltos
│   ├── UserController.java                 #   /api/users/{me, id}  (privado)
│   ├── CategoriesController.java           #   /api/v1/categories/**
│   ├── CustomersInfoController.java        #   /api/v1/customers/{me, id}
│   └── AddressController.java              #   /api/v1/addresses/**
│   (+ PersonController, StoreController — legacy muerto)
│
└── exceptions/                             # Excepciones transversales
    ├── InvalidCredentialsException.java
    ├── UserNotFoundException.java
    ├── UserAlreadyExistsException.java
    ├── CategoryDuplicateException.java
    └── AddressNotFoundException.java
```

### Sobre los paquetes "legacy muerto"

Hay clases que vinieron del template inicial (`Person`, `Store`) y no se
usan en ningún flujo del e-commerce. No se borraron aún porque no afectan
nada; si el grupo quiere limpiar el repo antes de la entrega final, son
candidatas seguras a eliminación (services + entities + controllers +
repositories completos).

---

## 6. Setup local paso a paso

Instrucciones completas están en el `README.md` raíz. Resumen:

```bash
# 1. JDK 17 (verificar)
java -version   # debe decir "17.x.x"

# 2. Docker MySQL (si no existe el container)
docker run -d --name tempus-mysql --restart unless-stopped \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=ecommerce_bd \
  -e MYSQL_USER=administrator \
  -e MYSQL_PASSWORD=admin1234 \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

# 3. Cargar schema + seed (ojo: --default-character-set=utf8mb4 para acentos)
docker exec -i tempus-mysql mysql --default-character-set=utf8mb4 \
  -uadministrator -padmin1234 ecommerce_bd < src/main/resources/schema.sql
docker exec -i tempus-mysql mysql --default-character-set=utf8mb4 \
  -uadministrator -padmin1234 ecommerce_bd < src/main/resources/data.sql

# 4. Arrancar la app
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH \
./mvnw spring-boot:run
# (en macOS/Windows ajustar JAVA_HOME a donde esté tu JDK 17)

# 5. Smoke test
curl -X POST http://localhost:4002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"buyer1","password":"buyer123"}'
```

El puerto default es **4002** (configurable en `application.properties`).

### ¿Por qué `ddl-auto=update`?

Con `update`, Hibernate compara las `@Entity` con el schema existente en
MySQL y sólo agrega columnas/tablas que falten. Es lo menos fricción posible
para desarrollo: si borrás una tabla por error, al arrancar la app se
vuelve a crear (vacía). Para reinicializar desde cero con los datos seed,
re-ejecutá `schema.sql` + `data.sql`.

---

## 7. Convenciones de código

### Lombok

Todas las entidades y DTOs usan Lombok para evitar boilerplate:

```java
@Data                               // getters + setters + toString + equals + hashCode
@NoArgsConstructor                  // constructor vacío (JPA lo exige)
@AllArgsConstructor                 // constructor con todos los fields
@Builder                            // builder pattern para crear instancias
@EqualsAndHashCode(onlyExplicitlyIncluded = true)   // evita recursión en relaciones
```

En entidades con relaciones bidireccionales (`@OneToMany` + `@ManyToOne`)
usamos `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` + una anotación
`@EqualsAndHashCode.Include` sobre el `id`. Sin esto, `equals()` recurre
infinitamente por el grafo de objetos.

En services usamos `@RequiredArgsConstructor` para inyección por constructor
de los `final` fields:

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    // Lombok genera el constructor con los 2 params automáticamente
}
```

### `@Transactional` — dónde va

- **Clase entera** `@Transactional` en services que mezclan lecturas y
  escrituras (`CartService`, `OrderService`).
- **Método a método** `@Transactional(readOnly = true)` en métodos que
  sólo leen — es una hint a Hibernate para optimizar y evitar flush
  innecesario.
- En métodos de lectura que **acceden a colecciones LAZY** (ej. mapear
  `Cart.items` a `CartResponse`), el `@Transactional` es **obligatorio**
  — si no, tira `LazyInitializationException` al serializar la respuesta.

### Exception handling

Todas las excepciones de dominio viven en
`purchaseservice/exception/` (aunque algunas son compartidas entre módulos
por razones históricas) o en `com.uade.tpo.demo.exceptions/`.

El `GlobalExceptionHandler` (`@ControllerAdvice`) las captura y mapea a un
`ErrorResponse` JSON uniforme:

```json
{
  "codigo": "CARRITO_NO_ENCONTRADO",
  "mensaje": "El carrito con ID 42 no fue encontrado",
  "timestamp": "2026-04-22T10:02:08.591",
  "ruta": "/api/v1/cart/42"
}
```

Mapeo:

| Excepción | HTTP | Código |
|---|---|---|
| `CarritoNoEncontradoException` | 404 | `CARRITO_NO_ENCONTRADO` |
| `CarritoInactivoException` | 409 | `CARRITO_INACTIVO` |
| `ProductoNoEncontradoException` | 404 | `PRODUCTO_NO_ENCONTRADO` |
| `StockInsuficienteException` | 409 | `STOCK_INSUFICIENTE` |
| `CantidadInvalidaException` | 400 | `CANTIDAD_INVALIDA` |
| `SolicitudInvalidaException` | 400 | `SOLICITUD_INVALIDA` |
| `ArticuloNoEncontradoException` | 404 | `ARTICULO_NO_ENCONTRADO` |
| `InvalidCredentialsException` | 401 | `CREDENCIALES_INVALIDAS` |
| `UserAlreadyExistsException` | 409 | `USUARIO_YA_EXISTE` |
| `UserNotFoundException` | 404 | `USUARIO_NO_ENCONTRADO` |
| `AccessDeniedException` (Spring) | 403 | `ACCESO_DENEGADO` |
| `Exception` (catchall) | 500 | `ERROR_INTERNO` |

### @PreAuthorize

Lo usamos en el **método** del controller para autorización fina:

- Para exigir "estar logueado": `@PreAuthorize("isAuthenticated()")` —
  típicamente a nivel de clase en controllers de cart/orders/addresses.
- Para exigir un rol específico: `@PreAuthorize("hasRole('ADMIN')")` —
  típicamente a nivel de método para operaciones de administración
  (`POST /products`, `DELETE /discounts`, etc.). Notar que Spring espera
  el **nombre sin el prefijo** `ROLE_` aquí (el framework lo agrega).

### Naming

- Controllers: `XxxController`, URL `/api/v1/xxx`
- Services: `XxxService` (interface + `XxxServiceImpl` solo si hay múltiples
  implementaciones — si hay una sola implementación, va todo en una clase
  concreta sin interface)
- Repositorios: `XxxRepository` que extiende `JpaRepository<Xxx, ID>`
- DTOs: `XxxRequest` para input, `XxxResponse` para output. Nunca `XxxDto`
  a secas.
- Entidades: singular (`Product`, no `Products`). Tablas plural
  (`products`).

---

## 8. Flujo de contribución

1. Crear branch desde `main`: `git checkout -b feat/nombre-descriptivo`
2. Commit mensajes tipo `feat:`, `fix:`, `chore:`, `test:` con descripción
   clara.
3. Antes de pushear:
   - `./mvnw compile` debe pasar.
   - `./mvnw test` debe pasar (todos los tests verdes).
   - Correr la app y hacer smoke test del flujo tocado (login + endpoint
     relevante).
4. Abrir PR y asignar reviewer del grupo.

### No romper el contrato

Si cambiás un campo de un DTO o una signature de un service público, asegurate
de actualizar:
- Todos los tests que lo usan
- El controller si es input/output
- La colección Postman (`postman/Tempus-API.postman_collection.json`)
- Esta documentación si es cambio de arquitectura

---

## 9. Cómo correr los tests

```bash
# Todos los tests
./mvnw test

# Un test específico
./mvnw test -Dtest=OrderServiceTest
./mvnw test -Dtest=OrderServiceTest#returnsOrderById

# Sólo compilar tests (sin correrlos)
./mvnw test-compile
```

### Estructura de tests

- `@ExtendWith(MockitoExtension.class)` + `@Mock` + `@InjectMocks` para
  services (puros unit tests con mocks).
- `@WebMvcTest(XxxController.class)` + `@AutoConfigureMockMvc(addFilters = false)`
  para controllers (slice tests; deshabilitamos filtros porque no queremos
  testear el JWT filter acá — eso se testea manualmente vía Postman).
- `@SpringBootTest` (sólo `DemoApplicationTests`) — sanity check de que el
  contexto arranca. Requiere MySQL corriendo.

Total actual: **62 tests** en 5 clases. Si agregás un service o controller
nuevo, agregá los tests correspondientes.

---

## 10. Documentos relacionados

- [`modulos.md`](modulos.md) — detalle funcional de cada módulo (auth,
  catálogo, compras, cliente, auditoría) con flujos clave.
- [`referencia.md`](referencia.md) — tabla completa de endpoints, mapping
  Entidad ↔ Clase Java ↔ Tabla BD, DTOs.
- `/README.md` (raíz del repo) — setup para el profesor + ejemplos cURL.
- `/docs/TAREAS_PENDIENTES.md` — checklist histórico del TP (algunas
  tareas ya resueltas).
- `/postman/Tempus-API.postman_collection.json` — colección Postman
  importable con 57 requests.
- `/DER.png` — diagrama entidad-relación oficial.
- `/Preentrega.pdf` — spec de la preentrega (rúbrica).

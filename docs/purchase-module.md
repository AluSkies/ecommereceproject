# Módulo de Compra — Documentación Técnica

## Índice

1. [Visión general](#1-visión-general)
2. [Estructura del módulo](#2-estructura-del-módulo)
3. [Modelo de dominio](#3-modelo-de-dominio)
4. [Subsistema: Carrito (`CartService`)](#4-subsistema-carrito-cartservice)
5. [Subsistema: Descuentos (`DiscountService`)](#5-subsistema-descuentos-discountservice)
6. [Subsistema: Órdenes (`OrderService`)](#6-subsistema-órdenes-orderservice)
7. [API REST — Endpoints](#7-api-rest--endpoints)
8. [Reglas de negocio](#8-reglas-de-negocio)
9. [Tests](#9-tests)
10. [Decisiones de diseño](#10-decisiones-de-diseño)

---

## 1. Visión general

El módulo de compra (`purchaseservice`) implementa el flujo completo desde que un usuario agrega un producto al carrito hasta que se genera y gestiona una orden de compra. El módulo se integra con el módulo de catálogo (`catalogservice`) existente para obtener datos de productos y stock.

```
[Catálogo] ──── consulta producto/stock ────> [Cart] ──── checkout ────> [Order]
                                                  ^                          |
                                                  |                          |
                                             [Discount] <─── aplica ────────┘
```

**Tecnologías:** Spring Boot 3.1.11 · Java 17 · Lombok · almacenamiento en memoria (sin base de datos).

---

## 2. Estructura del módulo

```
purchaseservice/
├── controller/
│   ├── CartController.java
│   ├── DiscountController.java
│   └── OrderController.java
├── service/
│   ├── CartService.java
│   ├── DiscountService.java
│   └── OrderService.java
├── repository/
│   ├── CartRepository.java
│   ├── DiscountRepository.java
│   └── OrderRepository.java
├── entity/
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Discount.java
│   ├── Order.java
│   ├── OrderItem.java
│   └── OrderStatusHistory.java
├── dto/
│   ├── cart/
│   │   ├── AddToCartRequest.java
│   │   ├── UpdateCartItemRequest.java
│   │   ├── CartItemResponse.java
│   │   └── CartResponse.java
│   ├── discount/
│   │   ├── DiscountRequest.java
│   │   ├── DiscountResponse.java
│   │   ├── ApplyDiscountRequest.java
│   │   └── ApplyDiscountResponse.java
│   └── order/
│       ├── CheckoutRequest.java
│       ├── OrderResponse.java
│       ├── OrderItemResponse.java
│       └── OrderStatusHistoryResponse.java
└── domain/
    ├── CartStatus.java
    └── OrderStatus.java
```

---

## 3. Modelo de dominio

### Entidades

#### Cart (Carrito)

| Campo       | Tipo           | Descripción                                  |
|-------------|----------------|----------------------------------------------|
| id          | Integer        | Identificador único                          |
| customerId  | Integer        | ID del cliente (nulo si es invitado)         |
| guestToken  | String         | Token de sesión para usuarios no registrados |
| status      | CartStatus     | Estado del carrito                           |
| items       | List\<CartItem\> | Ítems del carrito                          |
| expiresAt   | LocalDateTime  | Expiración automática (7 días)               |
| createdAt   | LocalDateTime  | Fecha de creación                            |
| updatedAt   | LocalDateTime  | Última modificación                          |

**Estados del carrito (`CartStatus`):**

```
ACTIVE ──── checkout ────> CONVERTED
  └──── abandono ────────> ABANDONED
```

#### CartItem (Ítem del carrito)

| Campo     | Tipo    | Descripción               |
|-----------|---------|---------------------------|
| cartId    | Integer | Referencia al carrito     |
| productId | Integer | Referencia al producto    |
| quantity  | Integer | Cantidad solicitada       |

Los precios **no** se almacenan en el carrito; se obtienen en tiempo real desde `ProductService`. El precio se captura definitivamente en el momento del checkout (ver `OrderItem`).

#### Discount (Cupón de descuento)

| Campo      | Tipo       | Descripción                                  |
|------------|------------|----------------------------------------------|
| id         | Integer    | Identificador único                          |
| code       | String     | Código del cupón (siempre en mayúsculas)     |
| name       | String     | Nombre descriptivo                           |
| percentage | BigDecimal | Porcentaje de descuento (ej: `10.00`)        |
| startsAt   | LocalDateTime | Fecha de inicio de vigencia               |
| endsAt     | LocalDateTime | Fecha de vencimiento                      |
| isActive   | boolean    | Activo/inactivo de forma manual              |
| createdAt  | LocalDateTime | Fecha de creación                         |

Un cupón es válido si: `isActive == true` AND `startsAt <= now` AND `endsAt >= now`.

**Cupones de muestra precargados:**

| Código      | Descuento | Vigencia              |
|-------------|-----------|----------------------|
| `RELOJES10` | 10%       | Vigente (30 días)    |
| `LUXURY20`  | 20%       | Vigente (30 días)    |

#### Order (Orden de compra)

| Campo            | Tipo              | Descripción                                       |
|------------------|-------------------|---------------------------------------------------|
| id               | Integer           | Identificador único                               |
| orderNumber      | String            | Número legible: `ORD-YYYYMMDD-NNNN`              |
| customerId       | Integer           | ID del cliente                                    |
| status           | OrderStatus       | Estado actual de la orden                         |
| items            | List\<OrderItem\> | Líneas de la orden (snapshot de precios)          |
| subtotal         | BigDecimal        | Subtotal sin descuento ni impuestos               |
| discountTotal    | BigDecimal        | Monto total del descuento aplicado                |
| shippingTotal    | BigDecimal        | Costo de envío fijo: ARS 15.00                    |
| taxTotal         | BigDecimal        | IVA calculado: 21% sobre (subtotal − descuento)  |
| grandTotal       | BigDecimal        | Total final a pagar                               |
| currency         | String            | Moneda (siempre `ARS`)                            |
| shippingSnapshot | String            | JSON con datos de envío al momento de la compra   |
| placedAt         | LocalDateTime     | Fecha en que se realizó el pedido                 |
| statusHistory    | List\<OrderStatusHistory\> | Auditoría completa de cambios de estado |

#### OrderItem (Línea de la orden)

| Campo       | Tipo       | Descripción                          |
|-------------|------------|--------------------------------------|
| productId   | Integer    | ID del producto                      |
| productName | String     | Nombre (capturado al momento de compra) |
| productSku  | String     | SKU (capturado al momento de compra) |
| unitPrice   | BigDecimal | Precio unitario (snapshot)           |
| quantity    | Integer    | Cantidad comprada                    |
| subtotal    | BigDecimal | `unitPrice × quantity`               |

> El snapshot de precio garantiza que cambios futuros en el catálogo no afecten órdenes históricas.

#### OrderStatusHistory (Historial de estados)

| Campo          | Tipo        | Descripción                       |
|----------------|-------------|-----------------------------------|
| orderId        | Integer     | Referencia a la orden             |
| previousStatus | OrderStatus | Estado anterior                   |
| newStatus      | OrderStatus | Nuevo estado                      |
| note           | String      | Nota opcional del cambio          |
| changedBy      | Integer     | ID del usuario que realizó el cambio |
| createdAt      | LocalDateTime | Timestamp del cambio            |

---

## 4. Subsistema: Carrito (`CartService`)

### Funcionalidades

**`addItem(AddToCartRequest)`**
- Valida que la cantidad sea mayor a 0.
- Verifica que el producto exista en el catálogo.
- Verifica que haya stock suficiente.
- Si el cliente ya tiene un carrito activo, lo reutiliza; de lo contrario, crea uno nuevo.
- Si el producto ya está en el carrito, **acumula la cantidad** en lugar de reemplazarla.
- Soporta usuarios registrados (`customerId`) e invitados (`guestToken`).

**`updateItemQuantity(cartId, productId, UpdateCartItemRequest)`**
- Si la nueva cantidad es 0, elimina el ítem del carrito.
- Si la cantidad es positiva, actualiza y valida stock.
- Solo permite modificar carritos en estado `ACTIVE`.

**`removeItem(cartId, productId)`**
- Elimina un ítem específico del carrito.
- Solo permite operar sobre carritos `ACTIVE`.

**`clearCart(cartId)`**
- Elimina todos los ítems del carrito, dejándolo vacío.

**`markAsConverted(cartId)`**
- Cambia el estado del carrito a `CONVERTED` una vez completado el checkout.

**`toResponse(Cart)`**
- Enriquece el carrito con datos de producto (nombre, SKU, precio) consultando `ProductService`.
- Calcula el subtotal sumando `unitPrice × quantity` de cada ítem.

---

## 5. Subsistema: Descuentos (`DiscountService`)

### Funcionalidades

**`createDiscount(DiscountRequest)`**
- Normaliza el código a mayúsculas antes de guardar.
- Rechaza códigos duplicados.

**`applyDiscount(subtotal, ApplyDiscountRequest)`**
- Verifica que el cupón exista, esté activo y dentro del período de vigencia.
- Calcula: `descuento = subtotal × (percentage / 100)`.
- Devuelve subtotal original, monto de descuento y subtotal final.

**`toggleActive(id)`**
- Invierte el estado `isActive` del cupón.

**`findValidByCode(code)`**
- Devuelve el cupón solo si pasa la validación completa (`isValid()`).
- Retorna `Optional.empty()` si no es válido (sin lanzar excepción). Utilizado internamente por `OrderService` para aplicar descuentos opcionales en el checkout.

**`getAllDiscounts()` / `getActiveDiscounts()` / `getById(id)` / `deleteDiscount(id)`**
- Operaciones CRUD estándar.

---

## 6. Subsistema: Órdenes (`OrderService`)

### Checkout

El método `checkout(CheckoutRequest)` realiza las siguientes operaciones en orden:

1. Obtiene el carrito por ID y valida que esté `ACTIVE` y no vacío.
2. Calcula el subtotal a partir del carrito.
3. Si se proveyó un código de descuento válido, calcula el `discountTotal`.
4. Calcula impuestos: `taxTotal = (subtotal − discountTotal) × 0.21`.
5. Calcula el total final: `grandTotal = (subtotal − discountTotal) + taxTotal + 15.00`.
6. Captura un snapshot de los datos de envío como JSON en `shippingSnapshot`.
7. Crea los `OrderItem` copiando precio, nombre y SKU del carrito (snapshot).
8. Persiste la orden con estado `PENDING` y agrega la primera entrada al historial.
9. Marca el carrito como `CONVERTED`.

**Fórmula de totales:**

```
subtotal        = Σ (unitPrice × quantity)  para cada ítem
discountTotal   = subtotal × (percentage / 100)   [si hay cupón válido, sino 0]
afterDiscount   = subtotal − discountTotal
taxTotal        = afterDiscount × 0.21
shippingTotal   = ARS 15.00  (fijo)
grandTotal      = afterDiscount + taxTotal + shippingTotal
```

**Formato del número de orden:** `ORD-YYYYMMDD-NNNN` (contador atómico desde 1000).

### Máquina de estados

La transición entre estados está estrictamente validada:

```
                  ┌─────────────┐
                  │   PENDING   │──── cancelar ───┐
                  └──────┬──────┘                 │
                         │ confirmar              │
                  ┌──────▼──────┐                 │
                  │  CONFIRMED  │──── cancelar ───┤
                  └──────┬──────┘                 │
                         │ procesar               │
                  ┌──────▼──────┐                 │
                  │  PROCESSING │──── cancelar ───┤
                  └──────┬──────┘                 │
                         │ enviar                 │
                  ┌──────▼──────┐                 │
                  │   SHIPPED   │                 │
                  └──────┬──────┘                 │
                         │ entregar               ▼
                  ┌──────▼──────┐          ┌────────────┐
                  │  DELIVERED  │──reemb.──>  CANCELLED /│
                  └─────────────┘          │  REFUNDED  │
                                           └────────────┘
```

Cualquier transición fuera de las flechas lanza `IllegalStateException`.

**`cancelOrder(id, reason, changedBy)`**
- Atajo para cancelar. Bloquea la cancelación si la orden ya está en `SHIPPED` o `DELIVERED`.

Cada cambio de estado genera automáticamente una entrada en `OrderStatusHistory` con el estado anterior, el nuevo estado, la nota y el timestamp.

---

## 7. API REST — Endpoints

### Carrito — `/api/v1/cart`

| Método   | Ruta                              | Descripción                          | Respuesta |
|----------|-----------------------------------|--------------------------------------|-----------|
| `POST`   | `/api/v1/cart/items`              | Agregar ítem al carrito              | 200 `CartResponse` / 400 |
| `GET`    | `/api/v1/cart/{cartId}`           | Obtener carrito por ID               | 200 / 404 |
| `GET`    | `/api/v1/cart/customer/{id}`      | Carrito activo de un cliente         | 200 / 404 |
| `GET`    | `/api/v1/cart/guest/{token}`      | Carrito activo de un invitado        | 200 / 404 |
| `PUT`    | `/api/v1/cart/{cartId}/items/{productId}` | Actualizar cantidad de ítem | 200 / 400 |
| `DELETE` | `/api/v1/cart/{cartId}/items/{productId}` | Eliminar ítem del carrito   | 200 `CartResponse` |
| `DELETE` | `/api/v1/cart/{cartId}`           | Vaciar el carrito                    | 204 / 404 |

**Ejemplo — Agregar ítem:**
```json
POST /api/v1/cart/items
{
  "customerId": 42,
  "productId": 1,
  "quantity": 2
}
```

### Descuentos — `/api/v1/discounts`

| Método    | Ruta                            | Descripción                               | Respuesta |
|-----------|---------------------------------|-------------------------------------------|-----------|
| `POST`    | `/api/v1/discounts`             | Crear cupón                               | 201 `DiscountResponse` / 400 |
| `GET`     | `/api/v1/discounts`             | Listar todos los cupones                  | 200 `[]` |
| `GET`     | `/api/v1/discounts/active`      | Listar solo cupones activos y vigentes    | 200 `[]` |
| `GET`     | `/api/v1/discounts/{id}`        | Obtener cupón por ID                      | 200 / 404 |
| `POST`    | `/api/v1/discounts/apply`       | Calcular descuento sobre un subtotal      | 200 `ApplyDiscountResponse` / 400 |
| `PATCH`   | `/api/v1/discounts/{id}/toggle` | Activar / desactivar cupón               | 200 / 404 |
| `DELETE`  | `/api/v1/discounts/{id}`        | Eliminar cupón                            | 204 |

**Ejemplo — Aplicar descuento:**
```json
POST /api/v1/discounts/apply?subtotal=1000.00
{
  "code": "RELOJES10"
}

// Respuesta:
{
  "code": "RELOJES10",
  "percentage": 10.00,
  "originalSubtotal": 1000.00,
  "discountAmount": 100.00,
  "finalSubtotal": 900.00
}
```

### Órdenes — `/api/v1/orders`

| Método   | Ruta                                | Descripción                              | Respuesta |
|----------|-------------------------------------|------------------------------------------|-----------|
| `POST`   | `/api/v1/orders/checkout`           | Realizar checkout desde carrito          | 201 `OrderResponse` / 400 |
| `GET`    | `/api/v1/orders/{id}`               | Obtener orden por ID                     | 200 / 404 |
| `GET`    | `/api/v1/orders/number/{number}`    | Obtener orden por número (`ORD-...`)     | 200 / 404 |
| `GET`    | `/api/v1/orders/customer/{id}`      | Listar órdenes de un cliente             | 200 `[]` |
| `GET`    | `/api/v1/orders`                    | Listar todas las órdenes (admin)         | 200 `[]` |
| `PATCH`  | `/api/v1/orders/{id}/status`        | Actualizar estado (admin)                | 200 / 400 |
| `PATCH`  | `/api/v1/orders/{id}/cancel`        | Cancelar orden                           | 200 / 400 |

**Ejemplo — Checkout:**
```json
POST /api/v1/orders/checkout
{
  "cartId": 1,
  "customerId": 42,
  "discountCode": "RELOJES10",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+5491123456789",
  "line1": "Av. Corrientes 1234",
  "city": "Buenos Aires",
  "region": "CABA",
  "postalCode": "C1043",
  "countryCode": "AR"
}
```

**Ejemplo — Actualizar estado:**
```json
PATCH /api/v1/orders/1/status
{
  "status": "CONFIRMED",
  "note": "Pago verificado",
  "changedBy": 99
}
```

**Ejemplo — Cancelar:**
```json
PATCH /api/v1/orders/1/cancel
{
  "reason": "El cliente solicitó cancelación",
  "changedBy": 42
}
```

---

## 8. Reglas de negocio

| # | Regla |
|---|-------|
| 1 | Un cliente solo puede tener **un carrito activo** a la vez. Si ya existe uno, se reutiliza. |
| 2 | Los carritos expiran a los **7 días** de su creación. |
| 3 | Los usuarios invitados se identifican por un `guestToken`. |
| 4 | Al agregar el mismo producto dos veces, la cantidad se **acumula** (no se reemplaza). |
| 5 | No se puede modificar un carrito en estado `CONVERTED` o `ABANDONED`. |
| 6 | Los precios del carrito se consultan en tiempo real; el precio de la orden se **congela al momento del checkout**. |
| 7 | El código de descuento se convierte a **mayúsculas** automáticamente al crearse. |
| 8 | Solo se aplica **un descuento** por orden. |
| 9 | Si el código de descuento del checkout no es válido, la orden se crea **sin descuento** (no falla). |
| 10 | El IVA es del **21%** y se calcula sobre el subtotal ya descontado. |
| 11 | El costo de envío es **fijo: ARS 15.00** por orden. |
| 12 | La moneda es siempre **ARS** (pesos argentinos). |
| 13 | No se puede cancelar una orden que ya fue **enviada o entregada**. |
| 14 | Todo cambio de estado queda registrado en el **historial de la orden**. |

---

## 9. Tests

Se implementaron **53 tests** distribuidos en 6 clases:

### Tests de servicios (unit tests con Mockito)

| Clase                  | Tests | Qué cubre |
|------------------------|-------|-----------|
| `CartServiceTest`      | 15    | addItem (7 escenarios), updateItemQuantity (3), removeItem/markAsConverted/getCart (4), cálculo de subtotal (2) |
| `DiscountServiceTest`  | 11    | createDiscount (2), applyDiscount (6), consultas y toggle (4) |
| `OrderServiceTest`     | 16    | checkout (6 escenarios), máquina de estados / cancelOrder (8), getOrder (3) |

### Tests de controladores (integración con MockMvc)

| Clase                      | Tests | Qué cubre |
|----------------------------|-------|-----------|
| `CartControllerTest`       | 12    | 7 endpoints, casos felices + errores |
| `DiscountControllerTest`   | 12    | 7 endpoints, casos felices + errores |
| `OrderControllerTest`      | 14    | 7 endpoints, casos felices + errores |

**Estrategia de testing:**
- Los tests de servicio usan `@ExtendWith(MockitoExtension.class)` con mocks de repositorios. Validan lógica de negocio de forma aislada.
- Los tests de controlador usan `@WebMvcTest` + `@MockBean` para aislar cada controlador, evitando estado compartido entre tests y sin necesidad de levantar el contexto completo de Spring.

---

## 10. Decisiones de diseño

**Almacenamiento en memoria**
Consistente con el módulo de catálogo existente. Los repositorios son listas en memoria con IDs autoincrementales. No requiere base de datos para desarrollo y pruebas.

**Sin Spring Security**
El proyecto no tiene autenticación implementada. Los endpoints no están protegidos. El campo `changedBy` en actualizaciones de estado se recibe explícitamente en el body.

**Integración con `catalogservice` vía servicio, no por HTTP**
`CartService` llama directamente a `ProductService.getProductById()` porque ambos módulos conviven en el mismo proceso. No hay microservicios ni llamadas HTTP entre módulos.

**`shippingSnapshot` como JSON string**
Los datos del comprador al momento de la compra se serializan como cadena JSON en lugar de una entidad separada. Esto simplifica el modelo para un almacenamiento en memoria y garantiza inmutabilidad del registro histórico.

**Descuento ignorado silenciosamente en checkout**
Si el código de descuento es inválido o vencido durante el checkout, la orden se crea sin descuento en lugar de fallar. Esto permite que el frontend muestre un aviso sin bloquear la compra.

**Contador atómico para números de orden**
`AtomicInteger` garantiza que el número de orden sea único incluso en contextos concurrentes, sin necesidad de una secuencia de base de datos.

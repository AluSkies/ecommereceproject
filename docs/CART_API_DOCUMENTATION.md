# Carrito de Compras (Shopping Cart) - Documentación API

## Descripción General / Overview

Sistema completo de carrito de compras con manejo de excepciones en español, integrado con las entidades existentes del proyecto de catálogo y compras.

**Complete shopping cart system with Spanish exception handling, integrated with existing catalog and purchase entities.**

---

## Características / Features

✅ **Dual Access Support** (Clientes y Invitados / Customers & Guests)  
✅ **Spanish Exception Handling** (Mensajes de error en español)  
✅ **Stock Validation** (Validación automática de inventario)  
✅ **Auto-merge Items** (Fusión automática de productos duplicados)  
✅ **7-Day Expiration** (Expiración automática en 7 días)  
✅ **Subtotal Calculation** (Cálculo de subtotales con precisión)  
✅ **In-memory Repository** (Repositorio en memoria)  

---

## Estructura del Carrito / Cart Structure

### Entidades / Entities

#### `Cart`
```
- id: Integer (ID único)
- customerId: Integer (ID del cliente, null para invitados)
- guestToken: String (Token único para invitados)
- status: CartStatus (ACTIVE, CONVERTED, ABANDONED)
- items: List<CartItem> (Artículos en el carrito)
- expiresAt: LocalDateTime (fecha de expiración)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

#### `CartItem`
```
- id: Integer
- cartId: Integer
- productId: Integer (Referencia a Product)
- quantity: Integer (Cantidad)
```

#### `CartStatus` (Enum)
```
- ACTIVE: Carrito activo
- CONVERTED: Convertido a orden
- ABANDONED: Abandonado (más de 7 días)
```

---

## Excepciones Personalizadas / Custom Exceptions

### Jerarquía de Excepciones / Exception Hierarchy

```
CarritoException (Base)
├── CarritoNoEncontradoException
├── ProductoNoEncontradoException
├── StockInsuficienteException
├── CantidadInvalidaException
├── SolicitudInvalidaException
├── CarritoInactivoException
└── ArticuloNoEncontradoException
```

### Códigos de Error / Error Codes

| Código | Descripción | HTTP Status |
|--------|-------------|------------|
| CARRITO_NO_ENCONTRADO | El carrito no existe | 404 |
| PRODUCTO_NO_ENCONTRADO | El producto no existe | 404 |
| STOCK_INSUFICIENTE | Inventario insuficiente | 409 |
| CANTIDAD_INVALIDA | Cantidad debe ser > 0 | 400 |
| SOLICITUD_INVALIDA | Datos de solicitud inválidos | 400 |
| CARRITO_INACTIVO | Carrito no está activo | 409 |
| ARTICULO_NO_ENCONTRADO | Artículo no en carrito | 404 |

---

## API Endpoints

### 1. Agregar Artículo al Carrito / Add Item to Cart

**POST** `/api/v1/cart/items`

**Request Body:**
```json
{
  "customerId": 1,
  "guestToken": null,
  "productId": 5,
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "customerId": 1,
  "guestToken": null,
  "status": "ACTIVE",
  "items": [
    {
      "productId": 5,
      "productName": "Rolex Submariner",
      "productSku": "ROLEX-001",
      "unitPrice": 9500.00,
      "quantity": 2,
      "lineTotal": 19000.00
    }
  ],
  "subtotal": 19000.00,
  "expiresAt": "2026-04-28T13:25:00",
  "updatedAt": "2026-04-21T13:25:00"
}
```

**Error Examples:**
```json
{
  "codigo": "CANTIDAD_INVALIDA",
  "mensaje": "Cantidad inválida: -1. Debe ser mayor que cero",
  "timestamp": "2026-04-21T13:26:00",
  "ruta": "/api/v1/cart/items"
}
```

---

### 2. Obtener Carrito por ID / Get Cart by ID

**GET** `/api/v1/cart/{cartId}`

**Example:** `GET /api/v1/cart/1`

**Response (200 OK):** [Same as Add Item response]

**Error (404 Not Found):**
```json
{
  "codigo": "CARRITO_NO_ENCONTRADO",
  "mensaje": "El carrito con ID 999 no fue encontrado",
  "timestamp": "2026-04-21T13:27:00",
  "ruta": "/api/v1/cart/999"
}
```

---

### 3. Obtener Carrito del Cliente / Get Customer's Cart

**GET** `/api/v1/cart/customer/{customerId}`

**Example:** `GET /api/v1/cart/customer/1`

**Response:** [Same cart structure]

---

### 4. Obtener Carrito de Invitado / Get Guest Cart

**GET** `/api/v1/cart/guest/{guestToken}`

**Example:** `GET /api/v1/cart/guest/550e8400-e29b-41d4-a716-446655440000`

**Response:** [Same cart structure]

---

### 5. Actualizar Cantidad de Artículo / Update Item Quantity

**PUT** `/api/v1/cart/{cartId}/items/{productId}`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Note:** Si quantity ≤ 0, el artículo se elimina automáticamente  
*(If quantity ≤ 0, the item is automatically removed)*

**Response (200 OK):** [Updated cart]

**Error (409 Conflict - Inactive Cart):**
```json
{
  "codigo": "CARRITO_INACTIVO",
  "mensaje": "El carrito con ID 1 no está activo. Estado actual: CONVERTED",
  "timestamp": "2026-04-21T13:30:00",
  "ruta": "/api/v1/cart/1/items/5"
}
```

**Error (409 Conflict - Insufficient Stock):**
```json
{
  "codigo": "STOCK_INSUFICIENTE",
  "mensaje": "Stock insuficiente para 'Rolex Day-Date'. Solicitado: 20, Disponible: 5",
  "timestamp": "2026-04-21T13:31:00",
  "ruta": "/api/v1/cart/1/items/5"
}
```

---

### 6. Eliminar Artículo del Carrito / Remove Item

**DELETE** `/api/v1/cart/{cartId}/items/{productId}`

**Example:** `DELETE /api/v1/cart/1/items/5`

**Response (200 OK):** [Updated cart without the item]

---

### 7. Vaciar Carrito / Clear Cart

**DELETE** `/api/v1/cart/{cartId}`

**Example:** `DELETE /api/v1/cart/1`

**Response (204 No Content)**

---

## Flujo de Uso / Usage Flow

### Escenario 1: Cliente Registrado / Registered Customer

```
1. POST /api/v1/cart/items
   { customerId: 1, productId: 5, quantity: 1 }
   → Crea carrito automáticamente si no existe
   
2. GET /api/v1/cart/customer/1
   → Obtiene carrito activo del cliente
   
3. PUT /api/v1/cart/1/items/5
   { quantity: 2 }
   → Actualiza cantidad
   
4. POST /api/v1/checkout
   → Convierte carrito a orden
```

### Escenario 2: Invitado / Guest User

```
1. POST /api/v1/cart/items
   { guestToken: "uuid-1234", productId: 10, quantity: 1 }
   → Crear carrito con token
   
2. GET /api/v1/cart/guest/uuid-1234
   → Ver carrito de invitado
   
3. PUT /api/v1/cart/2/items/10
   { quantity: 3 }
   → Actualizar cantidad
   
4. DELETE /api/v1/cart/2/items/10
   → Remover artículo
```

---

## Servicio CartService / CartService

### Métodos Principales / Main Methods

```java
// Agregar artículo
CartResponse addToCart(AddToCartRequest request)

// Obtener carrito
CartResponse getCartById(Integer carritoId)
CartResponse getCartByCustomerId(Integer customerId)
CartResponse getCartByGuestToken(String guestToken)

// Actualizar artículo
CartResponse updateItemQuantity(Integer carritoId, Integer productoId, UpdateCartItemRequest request)

// Remover artículo
CartResponse removeItem(Integer carritoId, Integer productoId)

// Limpiar carrito
void clearCart(Integer carritoId)

// Validación
void markAsConverted(Integer carritoId)
```

---

## Manejo de Excepciones / Exception Handling

### GlobalExceptionHandler

El controlador global de excepciones (`GlobalExceptionHandler`) intercepta todas las excepciones personalizadas del carrito y retorna respuestas JSON estructuradas con:

- **codigo**: Identificador del error
- **mensaje**: Descripción en español del problema
- **timestamp**: Cuándo ocurrió el error
- **ruta**: Endpoint que generó el error

### Ejemplo de Flujo de Excepción / Exception Flow Example

```
1. Usuario intenta agregar 100 unidades de un producto con solo 5 en stock
2. CartService lanza: StockInsuficienteException
3. GlobalExceptionHandler captura la excepción
4. Retorna HTTP 409 (CONFLICT) con mensaje en español
5. Cliente recibe:
{
  "codigo": "STOCK_INSUFICIENTE",
  "mensaje": "Stock insuficiente para 'Rolex Day-Date'. Solicitado: 100, Disponible: 5",
  "timestamp": "2026-04-21T13:35:00",
  "ruta": "/api/v1/cart/items"
}
```

---

## Arquitectura / Architecture

### Estructura de Paquetes / Package Structure

```
src/main/java/com/uade/tpo/demo/purchaseservice/
├── controller/
│   └── CartController.java
├── service/
│   └── CartService.java
├── repository/
│   └── CartRepository.java
├── entity/
│   ├── Cart.java
│   └── CartItem.java
├── domain/
│   └── CartStatus.java
├── dto/cart/
│   ├── AddToCartRequest.java
│   ├── CartResponse.java
│   ├── CartItemResponse.java
│   └── UpdateCartItemRequest.java
└── exception/
    ├── CarritoException.java
    ├── CarritoNoEncontradoException.java
    ├── ProductoNoEncontradoException.java
    ├── StockInsuficienteException.java
    ├── CantidadInvalidaException.java
    ├── SolicitudInvalidaException.java
    ├── CarritoInactivoException.java
    ├── ArticuloNoEncontradoException.java
    ├── ErrorResponse.java
    └── GlobalExceptionHandler.java
```

### Flujo de Solicitud / Request Flow

```
HTTP Request
    ↓
CartController (@RestController)
    ↓
CartService (business logic)
    ↓
ProductRepository (validate product & stock)
    ↓
CartRepository (save/retrieve cart)
    ↓
Response / Exception
    ↓
GlobalExceptionHandler (if error)
    ↓
JSON Response
```

---

## Validaciones Implementadas / Implemented Validations

✅ **Cantidad Válida** - Debe ser > 0  
✅ **Producto Existe** - Valida existencia en el catálogo  
✅ **Stock Disponible** - Verifica cantidad en inventario  
✅ **Carrito Activo** - Solo permite operaciones en carritos ACTIVE  
✅ **Cliente o Invitado** - Requiere identificación  
✅ **Expiration** - Marca carritos como ABANDONED después de 7 días  
✅ **Artículo en Carrito** - Verifica existencia antes de actualizar  

---

## Testing / Pruebas

### Casos de Prueba Recomendados / Recommended Test Cases

```bash
# 1. Crear carrito y agregar artículo (cliente)
POST /api/v1/cart/items
Body: { "customerId": 1, "productId": 1, "quantity": 2 }

# 2. Intentar agregar cantidad negativa (error)
POST /api/v1/cart/items
Body: { "customerId": 1, "productId": 1, "quantity": -5 }

# 3. Agregar producto inexistente (error)
POST /api/v1/cart/items
Body: { "customerId": 1, "productId": 99999, "quantity": 1 }

# 4. Obtener carrito existente
GET /api/v1/cart/1

# 5. Actualizar cantidad
PUT /api/v1/cart/1/items/1
Body: { "quantity": 5 }

# 6. Remover artículo
DELETE /api/v1/cart/1/items/1

# 7. Limpiar carrito
DELETE /api/v1/cart/1
```

---

## Notas de Implementación / Implementation Notes

- **En Memoria**: El CartRepository almacena carritos en memoria (no en base de datos)
- **Sincronización**: Las operaciones de carrito son sincrónicas
- **Logging**: Todos los métodos incluyen logging con SLF4J
- **Transacciones**: Las operaciones se manejan a nivel de servicio
- **Escalabilidad Futura**: Fácil migración a JPA/Hibernate

---

## Próximos Pasos / Future Enhancements

1. **Persistencia en BD** - Migrara database con Spring Data JPA
2. **Cache** - Agregar Redis para caché de carritos
3. **WebSocket** - Sincronización en tiempo real
4. **Cupones** - Integración con sistema de descuentos
5. **Analytics** - Seguimiento de abandono de carritos

---

**Última Actualización / Last Updated:** 2026-04-21  
**Versión / Version:** 1.0.0  
**Lenguaje / Language:** Java 17, Spring Boot 3.1.11

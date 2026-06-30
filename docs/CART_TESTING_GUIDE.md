# Guía de Testing - Cart API / Testing Guide - Cart API

## Configuración Inicial / Initial Setup

### Prerrequisitos / Prerequisites

- Spring Boot 3.1.11 servidor corriendo en http://localhost:8080
- Algunos productos existentes en el catálogo
- cURL o Postman para hacer solicitudes HTTP

---

## Testing com cURL

### 1. Crear Carrito y Agregar Primer Artículo

```bash
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "guestToken": null,
    "productId": 1,
    "quantity": 2
  }'
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 1,
  "customerId": 1,
  "guestToken": null,
  "status": "ACTIVE",
  "items": [
    {
      "productId": 1,
      "productName": "Prod Nombre",
      "productSku": "SKU-001",
      "unitPrice": 100.00,
      "quantity": 2,
      "lineTotal": 200.00
    }
  ],
  "subtotal": 200.00,
  "expiresAt": "2026-04-28T13:30:00",
  "updatedAt": "2026-04-21T13:30:00"
}
```

### 2. Obtener Carrito por ID

```bash
curl -X GET http://localhost:8080/api/v1/cart/1 \
  -H "Content-Type: application/json"
```

### 3. Obtener Carrito de Cliente

```bash
curl -X GET http://localhost:8080/api/v1/cart/customer/1 \
  -H "Content-Type: application/json"
```

### 4. Agregar Producto Duplicado (Auto-merge)

```bash
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "productId": 1,
    "quantity": 1
  }'
```

**Resultado:** La cantidad de productId 1 aumenta de 2 a 3 (no se crea nuevo item)

### 5. Actualizar Cantidad de Artículo

```bash
curl -X PUT http://localhost:8080/api/v1/cart/1/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

### 6. Remover Artículo del Carrito

```bash
curl -X DELETE http://localhost:8080/api/v1/cart/1/items/1 \
  -H "Content-Type: application/json"
```

### 7. Limpiar Carrito Completo

```bash
curl -X DELETE http://localhost:8080/api/v1/cart/1 \
  -H "Content-Type: application/json"
```

---

## Testing de Excepciones / Exception Testing

### 1. Cantidad Negativa → CantidadInvalidaException

```bash
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "productId": 1,
    "quantity": -5
  }'
```

**Respuesta (400 Bad Request):**
```json
{
  "codigo": "CANTIDAD_INVALIDA",
  "mensaje": "Cantidad inválida: -5. Debe ser mayor que cero",
  "timestamp": "2026-04-21T14:00:00",
  "ruta": "/api/v1/cart/items"
}
```

### 2. Producto No Existe → ProductoNoEncontradoException

```bash
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "productId": 99999,
    "quantity": 1
  }'
```

**Respuesta (404 Not Found):**
```json
{
  "codigo": "PRODUCTO_NO_ENCONTRADO",
  "mensaje": "El producto con ID 99999 no fue encontrado",
  "timestamp": "2026-04-21T14:01:00",
  "ruta": "/api/v1/cart/items"
}
```

### 3. Stock Insuficiente → StockInsuficienteException

```bash
# Suponiendo que el producto 1 tiene solo 5 en stock
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "productId": 1,
    "quantity": 100
  }'
```

**Respuesta (409 Conflict):**
```json
{
  "codigo": "STOCK_INSUFICIENTE",
  "mensaje": "Stock insuficiente para 'Producto Nombre'. Solicitado: 100, Disponible: 5",
  "timestamp": "2026-04-21T14:02:00",
  "ruta": "/api/v1/cart/items"
}
```

### 4. Carrito No Existe → CarritoNoEncontradoException

```bash
curl -X GET http://localhost:8080/api/v1/cart/99999 \
  -H "Content-Type: application/json"
```

**Respuesta (404 Not Found):**
```json
{
  "codigo": "CARRITO_NO_ENCONTRADO",
  "mensaje": "El carrito con ID 99999 no fue encontrado",
  "timestamp": "2026-04-21T14:03:00",
  "ruta": "/api/v1/cart/99999"
}
```

### 5. Artículo No en Carrito → ArticuloNoEncontradoException

```bash
# Intentar actualizar un artículo que no está en el carrito
curl -X PUT http://localhost:8080/api/v1/cart/1/items/999 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

**Respuesta (404 Not Found):**
```json
{
  "codigo": "ARTICULO_NO_ENCONTRADO",
  "mensaje": "El artículo con productId 999 no se encuentra en el carrito",
  "timestamp": "2026-04-21T14:04:00",
  "ruta": "/api/v1/cart/1/items/999"
}
```

---

## Testing con Invitado / Guest Testing

### 1. Crear Carrito de Invitado

```bash
curl -X POST http://localhost:8080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": null,
    "guestToken": "guest-550e8400-e29b-41d4-a716",
    "productId": 1,
    "quantity": 1
  }'
```

### 2. Obtener Carrito de Invitado

```bash
curl -X GET http://localhost:8080/api/v1/cart/guest/guest-550e8400-e29b-41d4-a716 \
  -H "Content-Type: application/json"
```

---

## Postman Collection / Colección de Postman

### Importar en Postman

1. Abrir Postman
2. Click en **Import** → **Paste raw text**
3. Copiar el siguiente JSON:

```json
{
  "info": {
    "name": "Cart API - Spring Boot 3",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Add Item to Cart",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"customerId\": 1, \"guestToken\": null, \"productId\": 1, \"quantity\": 2}"
        },
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/items",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "items"]
        }
      }
    },
    {
      "name": "Get Cart by ID",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "1"]
        }
      }
    },
    {
      "name": "Get Customer Cart",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/customer/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "customer", "1"]
        }
      }
    },
    {
      "name": "Update Item Quantity",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"quantity\": 5}"
        },
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/1/items/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "1", "items", "1"]
        }
      }
    },
    {
      "name": "Remove Item",
      "request": {
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/1/items/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "1", "items", "1"]
        }
      }
    },
    {
      "name": "Clear Cart",
      "request": {
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "1"]
        }
      }
    },
    {
      "name": "Test - Invalid Quantity",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"customerId\": 1, \"productId\": 1, \"quantity\": -5}"
        },
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/items",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "items"]
        }
      }
    },
    {
      "name": "Test - Product Not Found",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"customerId\": 1, \"productId\": 99999, \"quantity\": 1}"
        },
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/items",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "items"]
        }
      }
    },
    {
      "name": "Test - Cart Not Found",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/v1/cart/99999",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "v1", "cart", "99999"]
        }
      }
    }
  ]
}
```

---

## Escenario de Prueba Completo / Complete Test Scenario

### Step-by-Step Test Case

```
1. START: Crear nuevo carrito vacío para cliente
   POST /api/v1/cart/items
   Body: {customerId: 1, productId: 1, quantity: 2}
   Expected: 201 Created ✓
   
2. VERIFY: Obtener carrito creado
   GET /api/v1/cart/customer/1
   Expected: Carrito con 1 artículo (cantidad: 2) ✓
   
3. ADD DUPLICATE: Agregar mismo producto
   POST /api/v1/cart/items
   Body: {customerId: 1, productId: 1, quantity: 1}
   Expected: 200 OK, cantidad actualizada a 3 ✓
   
4. UPDATE: Cambiar cantidad
   PUT /api/v1/cart/{cartId}/items/1
   Body: {quantity: 5}
   Expected: 200 OK, cantidad: 5 ✓
   
5. ADD SECOND PRODUCT: Agregar otro producto
   POST /api/v1/cart/items
   Body: {customerId: 1, productId: 2, quantity: 1}
   Expected: 200 OK, ahora 2 artículos ✓
   
6. REMOVE: Eliminar primer artículo
   DELETE /api/v1/cart/{cartId}/items/1
   Expected: 200 OK, ahora 1 artículo ✓
   
7. CLEAR: Vaciar carrito
   DELETE /api/v1/cart/{cartId}
   Expected: 204 No Content ✓
```

---

## Checklist de Validación / Validation Checklist

- [ ] Crear carrito para cliente autenticado
- [ ] Agregar artículo al carrito
- [ ] Auto-merge: agregar mismo producto dos veces
- [ ] Actualizar cantidad de artículo
- [ ] Obtener carrito existente
- [ ] Remover artículo
- [ ] Limpiar carrito completo
- [ ] Crear carrito para invitado
- [ ] Obtener carrito de invitado
- [ ] Error: Cantidad negativa (CantidadInvalidaException)
- [ ] Error: Carrito no encontrado (CarritoNoEncontradoException)
- [ ] Error: Producto no encontrado (ProductoNoEncontradoException)
- [ ] Error: Stock insuficiente (StockInsuficienteException)
- [ ] Error: Artículo no en carrito (ArticuloNoEncontradoException)
- [ ] Verificar estructura de ErrorResponse
- [ ] Verificar mensajes en español

---

## Códigos HTTP Esperados / Expected HTTP Status Codes

| Operación | Éxito | Error |
|-----------|-------|--------|
| POST Agregar | 201 Created | 400, 404, 409 |
| GET Obtener | 200 OK | 404 |
| PUT Actualizar | 200 OK | 400, 404, 409 |
| DELETE Remover | 200 OK | 404, 409 |
| DELETE Limpiar | 204 No Content | 404 |

---

## Logging / Registro de Actividades

Todos los métodos del CartService registran:
- Entrada de método con parámetros
- Validaciones realizadas
- Operaciones completadas
- Excepciones lanzadas

Verificar logs en:
```
target/logs/application.log
```

---

**Última Actualización / Last Updated:** 2026-04-21

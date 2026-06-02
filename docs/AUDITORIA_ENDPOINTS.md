# Auditoría de cobertura: Postman → Frontend

Verifica que cada endpoint de `postman/Tempus-API.postman_collection.json` esté
usado por el frontend React (`frontend/src`), o que su ausencia esté justificada.

> Estado tras el cierre de huecos (este commit). Leyenda:
> ✅ usado · 🟢 nuevo (agregado en esta iteración) · 🟡 redundante (cubierto por otra vía) · ⚪ no aplica al frontend.

## Auth — `/api/v1/auth`
| Método | Endpoint | Estado | Dónde |
|---|---|---|---|
| POST | `/auth/register` | ✅ | `lib/auth.jsx` (`register`) |
| POST | `/auth/login` | ✅ | `lib/auth.jsx` (`login`) |
| POST | `/auth/logout` | ✅ | `lib/auth.jsx` (`logout`) |
| POST | `/auth/login` (credenciales inválidas) | ⚪ | mismo endpoint; es un test negativo 401 |

## Products — Público `/api/v1/products`
| Método | Endpoint | Estado | Dónde / Justificación |
|---|---|---|---|
| GET | `/products/active` | ✅ | `hooks/useWatches.js` |
| GET | `/products/{id}` | ✅ | `EditarProducto.jsx`, `EditarCupon` no; usado en admin |
| GET | `/products` (todos) | 🟡 | cubierto por `/active` |
| GET | `/products/available` | 🟡 | cubierto por `/active` |
| GET | `/products/search/category` | 🟡 | el catálogo filtra en cliente |
| GET | `/products/search/brand` | 🟡 | filtrado en cliente |
| GET | `/products/search/name` | 🟡 | búsqueda en cliente |
| GET | `/products/search/price` | 🟡 | filtrado en cliente |
| GET | `/products/inventory/low-stock` | 🟢 | `admin/AdminInventario.jsx` |
| GET | `/products/inventory/out-of-stock` | 🟢 | `admin/AdminInventario.jsx` |

## Products — Admin `/api/v1/products`
| Método | Endpoint | Estado | Dónde / Justificación |
|---|---|---|---|
| POST | `/products` | ✅ | `admin/NuevoProducto.jsx` |
| PUT | `/products/{id}` | ✅ | `admin/EditarProducto.jsx` |
| PATCH | `/products/{id}/status` | 🟢 | `admin/EditarProducto.jsx` (selector de estado, query param) |
| DELETE | `/products/{id}` | 🟢 | `admin/EditarProducto.jsx` (zona peligrosa) |
| PATCH | `/products/{id}/price` | 🟡 | cubierto por el `PUT` completo |
| PATCH | `/products/{id}/stock` | 🟡 | cubierto por el `PUT` completo |
| POST | `/products` (token BUYER → 403) | ⚪ | mismo endpoint; test negativo |

## Cart — `/api/v1/cart`
| Método | Endpoint | Estado | Dónde / Justificación |
|---|---|---|---|
| POST | `/cart/items` | ✅ | `lib/cart.jsx` |
| GET | `/cart/customer/{id}` | ✅ | `lib/cart.jsx` |
| PUT | `/cart/{cart}/items/{prod}` | ✅ | `lib/cart.jsx` |
| DELETE | `/cart/{cart}/items/{prod}` | ✅ | `lib/cart.jsx` |
| DELETE | `/cart/{cart}` | ✅ | `lib/cart.jsx` |
| GET | `/cart/{id}` | 🟡 | cubierto por `/cart/customer/{id}` |
| GET | `/cart/guest/{token}` | ⚪ | no hay carrito de invitado |
| GET | `/cart/{id}` (sin token → 401) | ⚪ | test negativo |

## Orders — `/api/v1/orders`
| Método | Endpoint | Estado | Dónde / Justificación |
|---|---|---|---|
| POST | `/orders/checkout` | ✅ | `Checkout.jsx` (ahora con `discountCode` validado) |
| GET | `/orders` | ✅ | `admin/AdminOrdenes.jsx` |
| GET | `/orders/{id}` | ✅ | `OrderConfirmation.jsx` |
| GET | `/orders/customer/{id}` | ✅ | `Orders.jsx` |
| PATCH | `/orders/{id}/status` | ✅ | `admin/AdminOrdenes.jsx` (incluye CANCELLED) |
| GET | `/orders/number/{n}` | 🟡 | ya se consulta por id |
| PATCH | `/orders/{id}/cancel` | 🟡 | la cancelación se hace vía `PATCH /status` |

## Discounts — `/api/v1/discounts`
| Método | Endpoint | Estado | Dónde |
|---|---|---|---|
| POST | `/discounts` | ✅ | `admin/NuevoCupon.jsx` |
| GET | `/discounts` | ✅ | `admin/GestionCupones.jsx` (tab "Todos") |
| PATCH | `/discounts/{id}/activate` | ✅ | `admin/GestionCupones.jsx` |
| PATCH | `/discounts/{id}/deactivate` | ✅ | `admin/GestionCupones.jsx` |
| DELETE | `/discounts/{id}` | ✅ | `admin/GestionCupones.jsx` |
| GET | `/discounts/{id}` | 🟢 | `admin/EditarCupon.jsx` (carga para editar) |
| PUT | `/discounts/{id}` | 🟢 | `admin/EditarCupon.jsx` |
| GET | `/discounts/code/{code}` | 🟢 | `Checkout.jsx` (validar cupón) |
| GET | `/discounts/active/valid` | 🟢 | `admin/GestionCupones.jsx` (tab "Vigentes") |
| GET | `/discounts/status/{status}` | 🟢 | `admin/GestionCupones.jsx` (tab "Activos") |
| GET | `/discounts/expired` | 🟢 | `admin/GestionCupones.jsx` (tab "Vencidos") |
| GET | `/discounts/scheduled` | 🟢 | `admin/GestionCupones.jsx` (tab "Programados") |

## User profile — `/api/users` (⚠️ controller `@Deprecated`)
| Método | Endpoint | Estado | Dónde / Justificación |
|---|---|---|---|
| GET | `/users/me` | 🟢 | `Perfil.jsx` (carga del perfil) |
| GET | `/users/{id}` | 🟢 | `admin/GestionUsuarios.jsx` (búsqueda por id) |
| PUT | `/users/{id}` | 🟢 | `Perfil.jsx` (guardar cambios) |
| PATCH | `/users/{id}/disable` | 🟢 | `admin/GestionUsuarios.jsx` |

> **Notas backend:**
> - `UserController` está marcado `@Deprecated` y mapeado a `/users` + `/api/users`
>   (fuera de `/api/v1`). El frontend lo consume con los helpers `usersApi*` de
>   `lib/api.js`, que usan `API_ROOT` (origen sin `/v1`). Si el backend retira este
>   controller, Perfil y Gestión de Usuarios deberán reapuntarse.
> - **No existe endpoint para listar todos los usuarios**, por eso el panel admin
>   funciona por búsqueda de ID + deshabilitar, no como tabla.

## Categories — `/api/v1/categories`
| Método | Endpoint | Estado | Dónde |
|---|---|---|---|
| GET | `/categories` | ✅ | `hooks/useWatches.js` + `admin/GestionCategorias.jsx` |
| POST | `/categories` | 🟢 | `admin/GestionCategorias.jsx` |
| GET | `/categories/{id}` | 🟡 | datos ya provistos por el listado |
| PUT | `/categories/{id}` | 🟢 | `admin/GestionCategorias.jsx` (existe en backend, no en Postman) |
| DELETE | `/categories/{id}` | 🟢 | `admin/GestionCategorias.jsx` (existe en backend, no en Postman) |

## Health
| Método | Endpoint | Estado | Justificación |
|---|---|---|---|
| GET | `/actuator/health` | ⚪ | endpoint de infraestructura, no es de UI |

---

## Resultado

Todos los huecos reales 🔴 identificados en la auditoría inicial quedaron cableados (🟢).
Los endpoints no implementados son únicamente **redundantes** (🟡, cubiertos por otra
ruta) o **no aplicables al frontend** (⚪, infraestructura o tests negativos). La
superficie funcional de la API queda completamente reflejada en la UI.

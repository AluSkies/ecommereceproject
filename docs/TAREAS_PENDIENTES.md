# Tareas Pendientes - Preentrega / Pending Tasks - Final Submission

**Fecha / Date:** 2026-04-21  
**Estado Actual / Current Status:** Carrito completado, Falta seguridad JWT  
**Current Status:** Cart completed, JWT security missing

---

## 🔴 CRÍTICO / CRITICAL - Seguridad (Security)

### 1. Implementar JWT y Autenticación
- [ ] Crear entidad `User` (@Entity)
  - username (unique)
  - password (hashed con BCrypt)
  - email
  - roles (relación con Role)
  - activo/inactivo
  - timestamps (createdAt, updatedAt)

- [ ] Crear entidad `Role` (@Entity)
  - name (ROLE_ADMIN, ROLE_USER, ROLE_CUSTOMER, etc.)
  - description

- [ ] Implementar `JwtTokenProvider`
  - generateToken(Authentication)
  - validateToken(token)
  - getSubjectFromToken(token)
  - getExpirationFromToken(token)
  - Configurar secret key y expiration time

- [ ] Crear `JwtAuthFilter` extends `OncePerRequestFilter`
  - Extraer token del header "Authorization: Bearer {token}"
  - Validar token
  - Poblar SecurityContextHolder
  - Pasar al siguiente filter

- [ ] Implementar `CustomUserDetailsService` implements `UserDetailsService`
  - Cargar usuario desde BD
  - Retornar UserDetails con roles

- [ ] Crear `/api/v1/auth/login` endpoint
  - Request: { username, password }
  - Response: { token, expiresIn, userInfo }
  - Usar AuthenticationManager
  - Generar JWT token

- [ ] Crear `/api/v1/auth/register` endpoint (opcional pero recomendado)
  - Request: { username, email, password, passwordConfirm }
  - Validaciones
  - Hashear password con BCrypt
  - Guardar usuario con rol ROLE_USER

- [ ] Configurar Spring Security (SecurityConfig)
  - Configurar JwtAuthFilter en filter chain
  - Configurer AuthenticationManager
  - Configurar BCryptPasswordEncoder
  - Definir endpoints públicos vs protegidos
  - @PreAuthorize en endpoints sensibles

---

## 🟡 ALTO / HIGH - Configuración & Setup

### 2. Archivos de Configuración
- [ ] Crear `application-dev.properties` con valores locales
- [ ] Crear `application-prod.properties` ejemplo
- [ ] Crear `application.properties.example` sin credenciales reales
- [ ] Documentar todas las propiedades necesarias

### 3. Scripts SQL
- [ ] Crear `schema.sql` - crear tablas
- [ ] Crear `seed-data.sql` - datos iniciales
  - Usuarios de prueba (admin, user)
  - Productos de ejemplo
  - Categorías
  - Roles

### 4. Variables de Entorno
- [ ] JWT secret key
- [ ] JWT expiration (ms)
- [ ] DB credentials (usar en application.properties, no en código)

---

## 🟠 MEDIO / MEDIUM - Documentación & Testing

### 5. README.md actualizado
- [ ] Descripción del proyecto
- [ ] Tecnologías usadas
- [ ] Requisitos previos (Java 17, MySQL, Maven)
- [ ] Pasos para ejecutar localmente
  - Clonar repo
  - Configurar DB
  - Ejecutar SQL scripts
  - Configurar application.properties
  - `mvn spring-boot:run`
- [ ] Ejemplos de uso cURL o Postman
- [ ] Estructura de carpetas explicada
- [ ] Troubleshooting común

### 6. Colección Postman/Insomnia
- [ ] Crear carpeta "Login"
  - POST /api/v1/auth/login
  - Guardar token en variable
  
- [ ] Crear carpeta "Endpoints Públicos"
  - GET /api/v1/products
  - GET /api/v1/categories
  
- [ ] Crear carpeta "Cart (Protegido)"
  - POST /api/v1/cart/items (con token)
  - GET /api/v1/cart (con token)
  - PUT /api/v1/cart/{id}/items/{productId} (con token)
  - DELETE /api/v1/cart/{id} (con token)
  
- [ ] Crear carpeta "Orders (Protegido)"
  - GET /api/v1/orders (con token)
  - POST /api/v1/orders/checkout (con token)
  
- [ ] Crear carpeta "Admin Only"
  - GET /api/v1/products (admin only)
  - POST /api/v1/products (admin only)
  - PUT /api/v1/products/{id} (admin only)
  - DELETE /api/v1/products/{id} (admin only)
  
- [ ] Exportar como .json

### 7. Proteger Endpoints Existentes
- [ ] Endpoints de Cart: agregar @PreAuthorize("isAuthenticated()")
- [ ] Endpoints de Orders: agregar @PreAuthorize("isAuthenticated()")
- [ ] Endpoints de Product admin (POST, PUT, DELETE): @PreAuthorize("hasRole('ADMIN')")
- [ ] Endpoints de Discount: @PreAuthorize("hasRole('ADMIN')")

---

## 📋 BAJO / LOW - PDF Final & Entrega

### 8. Documento PDF (Max 5 páginas)
- [ ] **Página 1 - Portada**
  - Número de grupo
  - Integrantes (nombre, legajo)
  - Fecha
  - Institución (UADE)
  - Profesor/Materia
  
- [ ] **Página 2 - Diagrama de Arquitectura**
  - Capas: Controller → Service → Repository
  - Security Filter Chain
  - DB Persistence (MySQL)
  - JWT Token Flow
  
- [ ] **Página 3 - Entidades y Mapeo**
  - Tabla con: Entidad | Clase Java | Tabla BD
  - Relaciones (FK)
  - User, Role, Product, Category, Cart, CartItem, Order, OrderItem, Discount
  
- [ ] **Página 4 - Tabla de Endpoints**
  - Columns: HTTP Method | URL | DTO/Entity | Auth Required | Role | Status Code
  - Incluir todos los endpoints
  
- [ ] **Página 5 - Evidencias (Screenshots)**
  - Tablas en Workbench
  - Login + JWT token recibido
  - Acceso a endpoint protegido con token
  - Error 403 sin token
  - Error 401 con rol insuficiente
  
- [ ] Link a GitHub repositorio público

### 9. Carpeta "evidencias/"
- [ ] Captura de Workbench - tablas de BD
- [ ] Captura de login en Postman
- [ ] Captura de JWT token
- [ ] Captura de endpoint protegido con token
- [ ] Captura de error 401 sin token
- [ ] Captura de error 403 con rol insuficiente

### 10. ZIP Final de Entrega
- [ ] src/ folder + pom.xml
- [ ] README.md
- [ ] application.properties.example
- [ ] schema.sql + seed-data.sql
- [ ] Postman collection (.json)
- [ ] evidencias/ folder con screenshots
- [ ] TAREAS_PENDIENTES.md (este archivo)
- [ ] Comprimido en "ecommerce-project-GRUPO-NUM.zip"

---

## 📊 Resumen de Estados / Status Summary

| Módulo | Completitud | Prioridad | Notas |
|--------|-------------|-----------|-------|
| **Producto/Catálogo** | 95% | Baja | Solo falta proteger admin endpoints |
| **Carrito** | 100% | ✅ DONE | Implementado con excepciones en español |
| **Órdenes** | 90% | Media | Falta protección de endpoints + validaciones |
| **Descuentos** | 85% | Media | Integrado en checkout, falta admin endpoints |
| **JWT/Autenticación** | 0% | 🔴 CRÍTICO | COMPLETAMENTE FALTA |
| **User Management** | 0% | 🔴 CRÍTICO | COMPLETAMENTE FALTA |
| **Spring Security Config** | 0% | 🔴 CRÍTICO | COMPLETAMENTE FALTA |
| **Documentación** | 20% | Alto | Carrito documentado, falta el resto |
| **Postman Collection** | 0% | Alto | No existe |
| **README.md** | 5% | Alto | Vacío o mínimo |
| **PDF de Entrega** | 0% | Alto | No iniciado |

---

## 🎯 Recomendación de Orden de Ejecución

1. **PRIMERO (Hoy)**: Implementar JWT + User + Security Config
   - Sin esto, no se puede demostrar seguridad
   - Es el requisito más crítico
   - ~3-4 horas de trabajo

2. **SEGUNDO**: Proteger todos los endpoints existentes
   - Agregar @PreAuthorize annotations
   - Crear roles diferentes
   - ~30 minutos

3. **TERCERO**: Documentación & Configuración
   - README.md
   - application.properties.example
   - Scripts SQL
   - ~1 hora

4. **CUARTO**: Postman Collection
   - Exportar todos los endpoints
   - ~30 minutos

5. **QUINTO**: PDF de Entrega
   - Compilar diagrama + tablas + evidencias
   - Tomar screenshots
   - ~2 horas

---

## ⏱️ Estimación Total

- **Crítico (Security)**: 3-4 horas
- **Alto (Config + Docs)**: 2-3 horas
- **Medio (Testing + PDF)**: 2-3 horas
- **Total estimado**: 7-10 horas

**Recomendación**: Empezar inmediatamente con JWT/User/Security para poder avanzar con testing y documentación.

---

## 📝 Notas Importantes

1. **JWT**: Usar bibliotecas estándar como `jjwt` o `spring-boot-starter-security` integrado
2. **Roles**: Mínimo 2 roles (ADMIN, USER), máximo 4 (ADMIN, USER, CUSTOMER, GUEST)
3. **Base de datos**: Asegurar que todas las entidades estén mapeadas con @Entity correctamente
4. **Testing**: Probar con Postman cada endpoint (public, protected, admin)
5. **Seguridad**: No incluir credenciales reales en el repo (usar .example)
6. **GitHub**: Asegurar que el repo esté público y accesible para corrección

---

**Próximo paso / Next step**: Empezar con implementación de User entity y JwtTokenProvider

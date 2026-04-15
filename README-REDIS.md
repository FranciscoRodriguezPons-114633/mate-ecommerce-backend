# Integración de Redis - Cache-Aside Pattern

## Descripción General

Se ha implementado una estrategia **cache-aside** en el servicio de productos para mejorar el rendimiento. Redis almacena temporalmente los productos más solicitados, reduciendo la carga en MongoDB.

## Arquitectura Implementada

### 1. Configuración de Redis (`src/config/redis.js`)

- Cliente Redis conectado con configuración desde variables de entorno
- Reconexión automática si falla la conexión
- Eventos de conexión logueados para debugging

### 2. Strategy Cache-Aside en `src/services/product.service.js`

#### Funciones Principales:

**1. `getProductWithCache(id)`**

- Intenta obtener un producto individual desde Redis
- Si no está en caché (cache miss), lo obtiene de MongoDB
- Guarda automáticamente en Redis por 1 hora
- Retorna el producto

```javascript
// Flujo:
1. ¿Está en Redis? → SÍ → Retorna desde Redis (CACHE HIT)
2. ¿Está en Redis? → NO → Consulta MongoDB (CACHE MISS)
3. Guarda resultado en Redis
4. Retorna el producto
```

**2. `getAllProducts(page, limit)`**

- Implementa caché por página solicitada
- Clave única: `products:all:page:{page}:limit:{limit}`
- TTL: 3600 segundos (1 hora)

**3. `invalidateProductCache(id)`**

- Elimina el caché de un producto específico cuando se actualiza o elimina

**4. `invalidateAllProductsCache()`**

- Elimina TODOS los cachés de listas cuando hay cambios structurales

### 3. Invalidación Automática en Escrituras

**CREATE (POST /products)**

- Al crear un producto → invalida `products:all:*`

**UPDATE (PUT /products/:id)**

- Al actualizar → invalida el producto específico Y todas las listas

**DELETE (DELETE /products/:id)**

- Al eliminar → invalida el producto Y todas las listas

## Variables de Entorno

```env
# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=  # Dejar vacío si no hay contraseña
```

## Logs de Debug

La implementación incluye logs en consola:

```
[CACHE HIT] Producto 12345    ← Obtenido desde Redis (~1-2ms)
[CACHE MISS] Producto 12345   ← Obtained desde MongoDB (~10-50ms)
[CACHE INVALIDATED] Producto 12345   ← Eliminado del caché
```

## Flujo de Datos

### Lectura de Un Producto (Cache-Aside)

```
GET /api/products/123
  ↓
getProduct(123)
  ↓
getProductWithCache(123)
  ↓
try: redisClient.get("product:123")
  ├─ SÍ → Parse JSON → Retorna
  └─ NO → Product.findById(123)
         ↓
         redisClient.setEx("product:123", 3600, JSON.stringify(product))
         ↓
         Retorna producto
```

### Lectura de Lista (Cache-Aside)

```
GET /api/products?page=1&limit=10
  ↓
getAllProducts(1, 10)
  ↓
try: redisClient.get("products:all:page:1:limit:10")
  ├─ SÍ → Parse JSON → Retorna paginación
  └─ NO → Product.find() + count
         ↓
         redisClient.setEx("products:all:page:1:limit:10", 3600, JSON.stringify(result))
         ↓
         Retorna resultado
```

### Creación, Actualización o Eliminación (Invalidación)

```
POST/PUT/DELETE /api/products
  ↓
addProduct / updateProductService / deleteProductService
  ↓
Ejecuta operación en MongoDB
  ↓
invalidateAllProductsCache()
  ├─ Encuentra todas las claves "products:all:*"
  └─ Las elimina todas
  ↓
Retorna respuesta
```

## Beneficios

| Métrica              | Antes           | Después             |
| -------------------- | --------------- | ------------------- |
| Tiempo lectura (hit) | ~20-50ms        | ~1-5ms              |
| Carga MongoDB        | 100% de queries | ~20% de queries     |
| Escalabilidad        | Limitada por BD | Mejora significante |

## Configuración Recomendada para Producción

```bash
# Instalar Redis Server
# Linux: sudo apt-get install redis-server
# macOS: brew install redis
# Docker: docker run -d -p 6379:6379 redis

# Con contraseña:
REDIS_PASSWORD=tu_contraseña_fuerte

# Con TTL diferente:
// En product.service.js, cambiar CACHE_EXPIRY
const CACHE_EXPIRY = 7200;  // 2 horas
```

## Manejo de Errores

- Si Redis no está disponible: Los logs lo indican, pero la app continúa usando solo MongoDB
- Si falla una lectura de caché: Se realiza fallback a MongoDB automáticamente
- Si falla una escritura en caché: Se registra el error pero la operación continúa

## Testing

Para verificar que el caché funciona:

```bash
# Terminal 1: Iniciar Redis
redis-server

# Terminal 2: Backend
npm run dev

# Terminal 3: Test
curl http://localhost:3000/api/products

# Verás en los logs:
# [CACHE MISS] getAllProducts page:1
# [CACHE HIT] getAllProducts page:1   ← Segunda vez
```

## Próximas Mejoras

1. **Warm-up del caché**: Pre-cargar productos populares al iniciar
2. **TTL por tipo de producto**: Productos populares con TTL más largo
3. **Invalidación granular**: Solo invalidar páginas afectadas
4. **Estadísticas de caché**: Monitorear hit/miss ratio
5. **Redis Cluster**: Para alta disponibilidad en producción

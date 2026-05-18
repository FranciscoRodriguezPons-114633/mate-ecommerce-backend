# Implementaciones realizadas - Mate Ecommerce Backend

Proyecto: `mate-ecommerce-backend`  
Contexto: TPG2 - Bases de Datos II - UTN FRC  
Stack base: Node.js/Express, MongoDB/Mongoose, Redis, Cassandra, Neo4j y frontend Next.js.

Este documento resume los cambios realizados durante la integracion de Cassandra, Redis, Neo4j, recomendaciones, analytics, carrito persistido, kit matero, descuentos administrativos, recorrido del cliente, mapas visuales interactivos y setup inicial del proyecto.

---

## 1. Resumen general

Se mantuvo MongoDB como base principal y fuente de verdad del ecommerce. Sobre esa base se agregaron bases especializadas:

- MongoDB: productos, usuarios, pedidos, stock y persistencia principal.
- Redis: cache para rankings/analytics y mejora de performance.
- Cassandra: pedidos desnormalizados, carrito con TTL, vistas de productos y ventas con counters.
- Neo4j: motor conceptual de recomendaciones, recorrido del cliente y kit matero, con fallback a MongoDB si Neo4j no esta disponible.
- Frontend: nuevas paginas, componentes visuales, descuentos, mapas SVG interactivos y secciones de recomendacion basadas en datos reales del backend.

La aplicacion sigue funcionando aunque Cassandra o Neo4j no esten levantados. En esos casos se usan fallbacks controlados para no romper el flujo principal. El indicador tecnico `Modo respaldo` se removio de la UI final porque confundia al usuario.

---

## 2. Dependencias agregadas

En `backend/package.json` se agregaron:

```json
"cassandra-driver": "^4.9.0",
"neo4j-driver": "^6.0.1"
```

Tambien se agregaron scripts:

```json
"seed:cassandra": "node src/seed.cassandra.js",
"seed:extras": "node src/seed.extra-products.js"
```

Uso:

```bash
cd backend
npm run seed:cassandra
npm run seed:extras
```

---

## 3. Variables de entorno

Se documentaron variables para Cassandra y Neo4j.

```env
# Cassandra Configuration
CASSANDRA_HOST=127.0.0.1
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=mate_ecommerce

# Neo4j Configuration
NEO4J_URI=bolt://127.0.0.1:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

Tambien se creo una guia completa de setup para nuevos integrantes:

- `SETUP_INICIAL.md`

Incluye dependencias, variables de entorno, Docker, seeds, comandos de arranque y solucion de problemas frecuentes.

---

## 4. Conexion de servicios en Express

Archivo principal:

- `backend/src/app.js`

Se agregaron conexiones no bloqueantes:

- `connectRedis()`
- `connectCassandra()`
- `connectNeo4j()`

Si Redis, Cassandra o Neo4j fallan, la app continua funcionando.

Rutas nuevas montadas:

```js
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/customer-journey", customerJourneyRoutes);
app.use("/api/kit-builder", kitBuilderRoutes);
```

---

## 5. Cassandra

### 5.1 Archivos creados

- `backend/src/config/cassandra.js`
- `backend/src/config/cassandra.schema.cql`
- `backend/src/services/order.cassandra.service.js`
- `backend/src/services/cart.service.js`
- `backend/src/services/analytics.service.js`
- `backend/src/services/sales.analytics.service.js`
- `backend/src/controllers/cart.controller.js`
- `backend/src/controllers/analytics.controller.js`
- `backend/src/seed.cassandra.js`

### 5.2 Conexion

Archivo: `backend/src/config/cassandra.js`

Implementa:

- Cliente singleton.
- `connectCassandra()`.
- `isCassandraAvailable()`.
- Retry policy del driver.
- Timeout de conexion.

La app no muere si Cassandra no esta disponible.

### 5.3 Schema Cassandra

Archivo: `backend/src/config/cassandra.schema.cql`

Tablas creadas:

1. `orders_by_user`
2. `orders_by_status`
3. `order_items`
4. `carts`
5. `product_views`
6. `product_sales`

### 5.4 Tablas desnormalizadas

#### `orders_by_user`

Uso: obtener los pedidos de un usuario.

```cql
CREATE TABLE IF NOT EXISTS orders_by_user (
  user_id     text,
  created_at  timestamp,
  order_id    uuid,
  mongo_order_id text,
  status      text,
  total       decimal,
  items       list<frozen<map<text, text>>>,
  PRIMARY KEY (user_id, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

Justificacion:

- Partition key: `user_id`.
- Clustering column: `created_at`.
- Permite listar pedidos de un cliente ordenados del mas reciente al mas antiguo.
- Se uso `text` para `user_id` porque el usuario viene de MongoDB como ObjectId, no como UUID.

#### `orders_by_status`

Uso: vista administrativa por estado.

```cql
CREATE TABLE IF NOT EXISTS orders_by_status (
  status      text,
  created_at  timestamp,
  order_id    uuid,
  mongo_order_id text,
  user_id     text,
  user_name   text,
  user_email  text,
  total       decimal,
  PRIMARY KEY (status, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

Justificacion:

- Partition key: `status`.
- Clustering column: `created_at`.
- Permite consultar pedidos agrupados por estado sin hacer filtros costosos.

#### `order_items`

Uso: items de un pedido.

```cql
CREATE TABLE IF NOT EXISTS order_items (
  order_id    uuid,
  product_id  text,
  name        text,
  price       decimal,
  quantity    int,
  subtotal    decimal,
  image       text,
  PRIMARY KEY (order_id, product_id)
);
```

Justificacion:

- Partition key: `order_id`.
- Clustering key: `product_id`.
- Todos los items de un pedido quedan juntos.

#### `carts`

Uso: carrito persistido con expiracion.

```cql
CREATE TABLE IF NOT EXISTS carts (
  user_id     text PRIMARY KEY,
  items       list<frozen<map<text, text>>>,
  updated_at  timestamp
);
```

TTL usado en el `INSERT`:

```cql
INSERT INTO carts (user_id, items, updated_at)
VALUES (?, ?, ?)
USING TTL 604800;
```

Justificacion:

- Un carrito por usuario.
- TTL de 7 dias.
- Coleccion Cassandra: `list<frozen<map<text, text>>>`.

#### `product_views`

Uso: contador de vistas.

```cql
CREATE TABLE IF NOT EXISTS product_views (
  product_id  text PRIMARY KEY,
  views       counter
);
```

#### `product_sales`

Uso: contador de ventas.

```cql
CREATE TABLE IF NOT EXISTS product_sales (
  product_id  text PRIMARY KEY,
  sales       counter
);
```

### 5.5 Consultas CQL implementadas

#### Crear pedido en batch

Servicio: `createOrderInCassandra()`

```cql
INSERT INTO orders_by_user
  (user_id, created_at, order_id, mongo_order_id, status, total, items)
VALUES (?, ?, ?, ?, ?, ?, ?);
```

```cql
INSERT INTO orders_by_status
  (status, created_at, order_id, mongo_order_id, user_id, user_name, user_email, total)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

```cql
INSERT INTO order_items
  (order_id, product_id, name, price, quantity, subtotal, image)
VALUES (?, ?, ?, ?, ?, ?, ?);
```

Las queries se ejecutan con:

```js
client.batch(queries, { prepare: true });
```

#### Obtener pedidos por usuario

```cql
SELECT order_id, mongo_order_id, created_at, status, total, items
FROM orders_by_user
WHERE user_id = ?;
```

#### Obtener pedidos por estado

```cql
SELECT order_id, mongo_order_id, created_at, status, user_id, user_name, user_email, total
FROM orders_by_status
WHERE status = ?;
```

#### Obtener items de un pedido

```cql
SELECT product_id, name, price, quantity, subtotal, image
FROM order_items
WHERE order_id = ?;
```

#### Actualizar estado de pedido

Cassandra no permite actualizar eficientemente una fila por columnas que no sean parte de la partition key. Por eso se implemento:

1. `SELECT` por `status` y `created_at`.
2. `DELETE` de la fila vieja en `orders_by_status`.
3. `UPDATE` de `orders_by_user`.
4. `INSERT` de la fila nueva en `orders_by_status`.

```cql
SELECT order_id, mongo_order_id, created_at, user_id, user_name, user_email, total
FROM orders_by_status
WHERE status = ? AND created_at = ?;
```

```cql
DELETE FROM orders_by_status
WHERE status = ? AND created_at = ?;
```

```cql
UPDATE orders_by_user
SET status = ?
WHERE user_id = ? AND created_at = ?;
```

```cql
INSERT INTO orders_by_status
  (status, created_at, order_id, mongo_order_id, user_id, user_name, user_email, total)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

#### Obtener todos los estados

Se ejecutan 5 consultas paralelas:

```js
Promise.all(STATUSES.map((status) => getOrdersByStatus(status)));
```

Estados:

```js
["pending", "paid", "shipped", "delivered", "cancelled"]
```

#### Guardar carrito con TTL

```cql
INSERT INTO carts (user_id, items, updated_at)
VALUES (?, ?, ?)
USING TTL 604800;
```

#### Obtener carrito

```cql
SELECT items, updated_at
FROM carts
WHERE user_id = ?;
```

#### Limpiar carrito

```cql
DELETE FROM carts
WHERE user_id = ?;
```

#### Incrementar vistas

```cql
UPDATE product_views
SET views = views + 1
WHERE product_id = ?;
```

#### Obtener vistas de producto

```cql
SELECT views
FROM product_views
WHERE product_id = ?;
```

#### Top productos vistos

```cql
SELECT product_id, views
FROM product_views
LIMIT ?;
```

Luego se ordena en memoria por `views DESC`.

#### Incrementar ventas

```cql
UPDATE product_sales
SET sales = sales + ?
WHERE product_id = ?;
```

#### Obtener ventas de producto

```cql
SELECT sales
FROM product_sales
WHERE product_id = ?;
```

#### Top productos vendidos

```cql
SELECT product_id, sales
FROM product_sales
LIMIT ?;
```

Luego se ordena en memoria por `sales DESC`.

### 5.6 Integracion con pedidos

Archivo: `backend/src/controllers/order.controller.js`

Flujo de creacion:

1. Crea pedido en MongoDB.
2. Registra pedido en Cassandra.
3. Incrementa ventas en Cassandra.
4. Limpia cache Redis de top vendidos.
5. Si Cassandra falla, la request no falla.

Flujo de lectura:

1. Intenta leer desde Cassandra.
2. Si Cassandra falla o no devuelve resultados, usa MongoDB.

---

## 6. Redis

Redis ya existia y se uso para cachear analytics.

Casos principales:

- Cache de productos mas vistos.
- Cache de productos mas vendidos.
- Invalidacion de cache cuando se registra una venta.

Ejemplo de invalidacion:

```js
const cacheKeys = await redisClient.keys("analytics:top-sold-products:*");
if (cacheKeys.length) {
  await redisClient.del(cacheKeys);
}
```

Si Redis no esta disponible, la aplicacion continua sin cache.

---

## 7. Analytics de productos

Archivos:

- `backend/src/services/analytics.service.js`
- `backend/src/services/sales.analytics.service.js`
- `backend/src/controllers/analytics.controller.js`
- `backend/src/routes/product.routes.js`

Rutas:

```http
POST /api/products/:id/view
GET  /api/products/analytics/top
GET  /api/products/analytics/top-sold
```

Funcionalidades:

- Registrar vista de producto en Cassandra.
- Obtener productos mas vistos.
- Registrar ventas por producto al crear pedidos.
- Obtener productos mas vendidos.
- Enriquecer respuestas con datos de MongoDB: nombre, imagen, precio, categoria.

---

## 8. Carrito persistido

Archivos:

- `backend/src/services/cart.service.js`
- `backend/src/controllers/cart.controller.js`
- `backend/src/routes/order.routes.js`

Rutas:

```http
GET    /api/orders/cart
POST   /api/orders/cart
DELETE /api/orders/cart
```

Caracteristicas:

- Carrito por usuario autenticado.
- Persistencia en Cassandra.
- TTL de 7 dias.
- Fallback silencioso si Cassandra no esta disponible.
- En frontend se mantiene compatibilidad con carrito local.

---

## 9. Neo4j

### 9.1 Archivos creados

- `backend/src/config/neo4j.js`
- `backend/src/config/neo4j.seed.cypher`
- `backend/src/services/recommendation.service.js`
- `backend/src/services/customerJourney.service.js`
- `backend/src/services/kitBuilder.service.js`
- `backend/src/controllers/recommendation.controller.js`
- `backend/src/controllers/customerJourney.controller.js`
- `backend/src/controllers/kitBuilder.controller.js`
- `backend/src/routes/recommendation.routes.js`
- `backend/src/routes/customerJourney.routes.js`
- `backend/src/routes/kitBuilder.routes.js`

### 9.2 Conexion

Archivo: `backend/src/config/neo4j.js`

Implementa:

- Driver oficial `neo4j-driver`.
- `connectNeo4j()`.
- `closeNeo4j()`.
- `isNeo4jAvailable()`.

Si Neo4j no esta disponible, se usa fallback a MongoDB.

### 9.3 Modelo de grafo utilizado

Modelo conceptual:

```text
(User)-[:COMPRÓ]->(Order)-[:CONTIENE {cantidad}]->(Product)-[:PERTENECE_A]->(Category)
(Product)-[:COMPLEMENTA]->(Product)
```

En algunos servicios tambien se contempla el modelo en ingles:

```text
(User)-[:PURCHASED]->(Product)-[:IN_CATEGORY]->(Category)
```

Esto se hizo para soportar tanto las consultas propuestas del TP como el fallback implementado.

### 9.4 Seed de relaciones COMPLEMENTA

Archivo: `backend/src/config/neo4j.seed.cypher`

```cypher
MATCH (p1:Product), (p2:Product)
WHERE p1.nombre CONTAINS "Mate" AND p2.nombre CONTAINS "Bombilla"
MERGE (p1)-[:COMPLEMENTA]->(p2)
MERGE (p2)-[:COMPLEMENTA]->(p1);
```

```cypher
MATCH (p1:Product), (p2:Product)
WHERE p1.nombre CONTAINS "Yerba" AND (p2.nombre CONTAINS "Yerbera" OR p2.nombre CONTAINS "Set")
MERGE (p1)-[:COMPLEMENTA]->(p2)
MERGE (p2)-[:COMPLEMENTA]->(p1);
```

```cypher
MATCH (p1:Product), (p2:Product)
WHERE p1.nombre CONTAINS "Termo" AND (p2.nombre CONTAINS "Mate" OR p2.nombre CONTAINS "Set")
MERGE (p1)-[:COMPLEMENTA]->(p2)
MERGE (p2)-[:COMPLEMENTA]->(p1);
```

---

## 10. Motor de recomendaciones

Archivos:

- `backend/src/services/recommendation.service.js`
- `backend/src/controllers/recommendation.controller.js`
- `backend/src/routes/recommendation.routes.js`
- `frontend/app/recomendaciones/page.tsx`

Ruta:

```http
GET /api/recommendations?limit=8
```

### 10.1 Consulta Cypher colaborativa

```cypher
MATCH (me:User {id: $userId})-[:PURCHASED]->(owned:Product)
MATCH (similar:User)-[:PURCHASED]->(owned)
WHERE similar.id <> me.id
MATCH (similar)-[purchase:PURCHASED]->(candidate:Product)
WHERE NOT (me)-[:PURCHASED]->(candidate)
OPTIONAL MATCH (candidate)-[:IN_CATEGORY]->(category:Category)
RETURN candidate, category, count(DISTINCT similar) AS similarUsers, sum(purchase.quantity) AS score
ORDER BY score DESC, similarUsers DESC
LIMIT $limit;
```

Objetivo:

- Buscar usuarios similares.
- Recomendar productos comprados por esos usuarios.
- Evitar recomendar productos que el usuario ya compro.

### 10.2 Consulta Cypher por categoria

```cypher
MATCH (me:User {id: $userId})-[:PURCHASED]->(:Product)-[:IN_CATEGORY]->(category:Category)
MATCH (category)<-[:IN_CATEGORY]-(candidate:Product)
WHERE NOT (me)-[:PURCHASED]->(candidate)
RETURN candidate, category
LIMIT $limit;
```

Objetivo:

- Recomendar productos de categorias que el usuario ya consume.

### 10.3 Consulta Cypher de beneficios/descuentos

Se agrego una consulta para productos con descuento activo. Se usa en la seccion `Packs y descuentos`.

```cypher
MATCH (p:Product)
WITH p,
     coalesce(p.descuento, p.discountPercentage, 0) AS descuento,
     coalesce(p.precio, p.price, 0) AS precioActual,
     coalesce(p.precioOriginal, p.price, p.precio, 0) AS precioOriginal
WHERE descuento IS NOT NULL AND descuento > 0
RETURN p.id AS id,
       coalesce(p.nombre, p.name) AS nombre,
       coalesce(p.imageUrl, p.image) AS imageUrl,
       precioActual,
       precioOriginal,
       descuento
ORDER BY descuento DESC
LIMIT $limit;
```

El backend primero intenta obtener beneficios desde Neo4j y luego usa MongoDB como respaldo.

### 10.4 Fix de parametros `LIMIT` en Neo4j

Neo4j exige que `LIMIT` reciba un entero. El driver estaba enviando `8.0`, provocando:

```txt
LIMIT: Invalid input. '8.0' is not a valid value. Must be a non-negative integer.
```

Se corrigio con `neo4j.int()`:

```js
const toNeo4jLimit = (limit, fallback = 8) => {
  const parsedLimit = Number(limit);
  const safeLimit = Number.isFinite(parsedLimit) && parsedLimit >= 0
    ? Math.trunc(parsedLimit)
    : fallback;

  return neo4j.int(safeLimit);
};
```

### 10.5 Fallback MongoDB

Si Neo4j no esta disponible, el servicio:

1. Lee pedidos del usuario.
2. Obtiene productos comprados y categorias.
3. Busca pedidos de otros usuarios con productos o categorias compartidas.
4. Calcula score por cantidad y cercania.
5. Devuelve recomendaciones y datos auxiliares para el frontend.

### 10.6 Frontend de recomendaciones

Pagina:

- `frontend/app/recomendaciones/page.tsx`

Implementado:

- Cards de productos recomendados.
- Estadisticas del historial.
- Seccion interactiva que reemplazo el grafo tecnico.
- Filtros:
  - `Tus favoritos`
  - `Compras juntas`
  - `Packs y descuentos`
  - `Categorias`

La visual vieja de nodos/relaciones fue removida porque era poco clara para usuario final.

### 10.7 Mapas SVG interactivos

Se implementaron 4 mapas visuales dentro de `/recomendaciones`, sin usar D3 ni Cytoscape. Todos usan SVG generado desde React, animaciones CSS y datos reales del backend.

Estilo compartido:

- Fondo externo: `#F5EDD8`.
- Fondo interno: `#E8D9BE`.
- Nodo central con gradiente `#D4793A -> #7A3010`.
- Conectores punteados `#9A6030`.
- Stats con fondo `#EDE0CC`.
- Animaciones:
  - `pulse-ring`
  - `glow-center`
  - `float-node`

#### Mapa de favoritos

Subtitulo:

```text
Productos que más se repiten y sugerencias cercanas para recompra.
```

Comportamiento:

- Productos comprados repetidamente: badge `repite`.
- Productos sugeridos: badge `sugiere`.
- Nodo central con `✦` y nombre del usuario.
- Nodos flotantes con delay escalonado.
- Tooltip con detalle y link al producto.
- Corazon del header clickeable: se rellena visualmente al hacer click. No persiste datos ni modifica recomendaciones.

Stats:

- Cantidad de favoritos.
- Maximo de repeticiones.
- Cantidad de sugerencias.

#### Mapa de compras juntas

Subtitulo:

```text
Productos que comprás juntos y combos populares entre clientes similares.
```

Comportamiento:

- Pares comprados juntos: badge `juntos`.
- Sugerencias de combo: badge `combo popular`.
- Linea doble entre productos comprados juntos.
- Nodo central con icono de capas.
- Tooltip con precio y link al producto.

Stats:

- Pares de productos comprados juntos.
- Combo mas repetido.
- Sugerencias de combo nuevas.

#### Mapa de beneficios

Subtitulo:

```text
Productos con descuentos activos cargados desde el panel de administración.
```

Comportamiento:

- Productos con descuento: badge `-X%`.
- Nodo central `Beneficio`.
- Descuentos mayores o iguales a 50% tienen borde mas grueso.
- Tooltip con precio actual, precio original tachado, porcentaje de ahorro y link al producto.

Stats:

- Total de ofertas activas.
- Mayor descuento activo.
- Ofertas fuertes con descuento mayor o igual a 30%.

#### Mapa de categorias

Subtitulo:

```text
Categorías que exploraste y las que todavía te faltan descubrir.
```

Comportamiento:

- Categorias ya compradas: nodo verde con badge de cantidad.
- Categorias no compradas: nodo beige punteado con badge `explorar`.
- Nodo central con icono de tag.
- Tooltip con producto destacado y boton `Ver categoría`.
- El tooltip se posiciona en una esquina segura del mapa para no tapar contenido.
- Se agrego boton `x` y toggle al volver a clickear el mismo nodo.

Stats:

- Categorias exploradas.
- Categoria favorita.
- Categorias sin explorar.

### 10.8 Ajustes de UX recientes

- Se elimino de la UI el cartel `Modo respaldo / Datos sincronizados`.
- El cartel era util para debug pero confundia al usuario final.
- Se mantiene el fallback internamente.

---

## 11. Recorrido del matero

Archivos:

- `backend/src/services/customerJourney.service.js`
- `backend/src/controllers/customerJourney.controller.js`
- `backend/src/routes/customerJourney.routes.js`
- `frontend/app/mi-recorrido/page.tsx`

Ruta:

```http
GET /api/customer-journey
```

### 11.1 Consulta Cypher del timeline

```cypher
MATCH (u:User {id: $userId})-[:COMPRÓ]->(o:Order)-[:CONTIENE]->(p:Product)-[:PERTENECE_A]->(c:Category)
RETURN o.id AS orderId, o.fecha AS fecha, o.total AS total, o.estado AS estado,
       collect({id: p.id, nombre: p.nombre, imagen: p.imageUrl, categoria: c.nombre}) AS productos
ORDER BY fecha ASC;
```

### 11.2 Logica implementada

El backend arma:

- Datos del usuario.
- Timeline de pedidos.
- Productos por pedido.
- Categorias nuevas detectadas.
- Total de pedidos.
- Categorias compradas.
- Producto mas comprado.
- Prediccion de proxima categoria.
- Nivel del usuario.

Niveles:

```text
1 categoria  -> Iniciado
2 categorias -> Aprendiz
3 categorias -> Conocedor
4 categorias -> Matero
5 categorias -> Maestro matero
```

Frontend:

- Pagina `/mi-recorrido`.
- Header de perfil.
- Timeline visual.
- Barra de progreso.
- Prediccion del siguiente paso.

---

## 12. Armador de kit matero

Archivos:

- `backend/src/services/kitBuilder.service.js`
- `backend/src/controllers/kitBuilder.controller.js`
- `backend/src/routes/kitBuilder.routes.js`
- `frontend/components/mate-kit-builder.tsx`
- `frontend/app/kit-armador/page.tsx`

Ruta:

```http
GET /api/kit-builder
```

### 12.1 Categorias fijas del kit

```js
["Yerba", "Calabazas", "Bombillas", "Termos", "Yerberas"]
```

### 12.2 Consulta Cypher del kit

```cypher
MATCH (u:User {id: $userId})-[:COMPRÓ]->(:Order)-[:CONTIENE]->(p:Product)-[:PERTENECE_A]->(c:Category)
WITH collect(DISTINCT c.nombre) AS categoriasCompradas
WITH categoriasCompradas, [c IN $todasLasCategorias WHERE NOT c IN categoriasCompradas] AS faltantes
UNWIND faltantes AS catFaltante
MATCH (p:Product)-[:PERTENECE_A]->(c:Category {nombre: catFaltante})
OPTIONAL MATCH (:User)-[:COMPRÓ]->(:Order)-[:CONTIENE]->(p)
RETURN categoriasCompradas,
       catFaltante,
       p.id AS productoId,
       p.nombre AS nombre,
       p.imageUrl AS imagen,
       p.precio AS precio,
       count(*) AS vecesComprado
ORDER BY catFaltante, vecesComprado DESC;
```

### 12.3 Logica implementada

El backend:

1. Detecta categorias compradas por el usuario.
2. Marca cada categoria como:
   - `owned`
   - `missing`
3. Para categorias faltantes, recomienda un producto real de MongoDB.
4. Calcula progreso.
5. Si se completan las 5 categorias, devuelve cupon:

```json
{
  "code": "MATERO10",
  "message": "Felicitaciones, completaste tu kit y te ganaste un cupón.",
  "discount": 10
}
```

Tambien se corrigio un bug de clasificacion:

- `Set Completo Matero Premium` antes caia como `Calabazas` por contener la palabra `mate`.
- Ahora los productos de categoria `Sets` cuentan como `Yerberas` para completar el kit.

### 12.4 Frontend

Componente:

- `frontend/components/mate-kit-builder.tsx`

Ubicacion actual:

- `/recomendaciones`

La pagina `/kit-armador` se dejo como redireccion hacia `/recomendaciones` para evitar duplicar la misma experiencia en dos lugares.

UI:

- Grid de 5 cards.
- Badge `Ya lo tenes` o `Te falta`.
- Imagen del producto comprado o recomendado.
- Boton `Agregar al carrito`.
- Boton para agregar todos los faltantes.
- Barra de progreso visual.
- Mensaje de cupon cuando el kit esta completo.

---

## 13. Frontend analytics

Componentes creados:

- `frontend/components/top-viewed-products.tsx`
- `frontend/components/top-sold-nodes.tsx`

### 13.1 Mas vistos

Componente: `TopViewedProducts`

Muestra productos mas vistos desde:

```http
GET /api/products/analytics/top
```

Visual:

- Cards de productos.
- Imagen.
- Nombre.
- Categoria.
- Cantidad de vistas.
- Link al detalle.

### 13.2 Mas vendidos

Componente: `TopSoldNodes`

Muestra productos mas vendidos desde:

```http
GET /api/products/analytics/top-sold
```

Visual:

- Nodos circulares.
- Nodo mas grande segun cantidad de ventas.
- Link al producto cuando tiene `_id` real de MongoDB.

---

## 14. Productos nuevos y stock

Archivo:

- `backend/src/seed.extra-products.js`

Se agrego un seed extra que:

1. Genera imagenes JPG en `frontend/public`.
2. Actualiza stock de productos existentes.
3. Inserta o actualiza 10 productos nuevos.

Comando:

```bash
cd backend
npm run seed:extras
```

### 14.1 Productos agregados

1. Mate Camionero de Cuero Marron
2. Mate Torpedo Premium Negro
3. Bombilla Premium Pico Plano
4. Bombilla Resorte Desmontable
5. Yerba Mate Barbacua 1kg
6. Yerba Mate Blend con Hierbas 500g
7. Termo Pico Cebador Negro 1.2L
8. Yerbera de Cuero con Pico Vertedor
9. Set Matero Viajero Compacto
10. Cepillo Limpiador de Bombilla

Cada producto incluye:

- Nombre.
- Descripcion.
- Precio.
- Stock.
- Categoria.
- Imagen propia.

### 14.2 Imagenes generadas

Se generaron assets en:

- `frontend/public/product-mate-camionero-cuero.jpg`
- `frontend/public/product-mate-torpedo-negro.jpg`
- `frontend/public/product-bombilla-pico-plano.jpg`
- `frontend/public/product-bombilla-resorte.jpg`
- `frontend/public/product-yerba-barbacua.jpg`
- `frontend/public/product-yerba-hierbas.jpg`
- `frontend/public/product-termo-negro-12.jpg`
- `frontend/public/product-yerbera-cuero.jpg`
- `frontend/public/product-set-viajero.jpg`
- `frontend/public/product-cepillo-bombilla.jpg`

Verificacion realizada:

- Total de productos en MongoDB: `20`.
- Productos sin stock: `0`.
- Productos nuevos insertados: `10`.

---

## 15. Cambios en navegacion frontend

Archivo:

- `frontend/components/header.tsx`

Se agregaron accesos a:

- `/recomendaciones`
- `/mi-recorrido`

Se removio el acceso directo a `/kit-armador` porque el kit quedo integrado dentro de `/recomendaciones`.

Paginas nuevas:

- `frontend/app/recomendaciones/page.tsx`
- `frontend/app/mi-recorrido/page.tsx`
- `frontend/app/kit-armador/page.tsx`

Nota:

- `/kit-armador` redirecciona a `/recomendaciones`.

---

## 16. Descuentos administrables

Se agrego soporte de descuentos por producto desde el panel administrador.

### 16.1 Backend

Modelo:

- `backend/src/models/Product.js`

Campo agregado:

```js
discountPercentage: {
  type: Number,
  default: 0,
  min: 0,
  max: 90,
}
```

Validaciones:

- `backend/src/middlewares/validateProductSchema.js`
- `backend/src/utils/productValidators.js`
- `backend/src/services/product.service.js`

Reglas:

- Descuento minimo: `0`.
- Descuento maximo: `90`.
- El backend rechaza valores fuera de rango.

Pedidos:

- `backend/src/services/order.service.js`

Al crear un pedido se calcula el precio final con descuento para subtotal y total.

### 16.2 Frontend

Archivos principales:

- `frontend/app/admin/page.tsx`
- `frontend/components/product-card.tsx`
- `frontend/app/productos/page.tsx`
- `frontend/app/productos/[id]/page.tsx`
- `frontend/lib/api.ts`

Helpers agregados:

```ts
getProductDiscount(product)
getProductFinalPrice(product)
isProductDiscounted(product)
```

Panel admin:

- Slider/input para descuento.
- Preview de precio final.
- Badge `OFF`.
- Estadistica de productos con descuento.

Donde se muestran descuentos:

- Cards del catalogo.
- Productos destacados.
- Detalle de producto.
- Recomendaciones.
- Kit matero.
- Productos mas vistos.
- Productos mas vendidos.
- Mapa de beneficios.

---

## 17. Guia de setup inicial

Archivo creado:

- `SETUP_INICIAL.md`

Contenido:

- Requisitos previos.
- Instalacion de dependencias.
- Configuracion de `.env`.
- Docker para MongoDB, Redis, Cassandra y Neo4j.
- Seeds del proyecto.
- Comandos para levantar backend y frontend.
- URLs principales.
- Verificaciones rapidas.
- Problemas frecuentes.

Servicios Docker documentados:

```bash
docker run -d --name mate-mongo -p 27017:27017 mongo:7
docker run -d --name mate-redis -p 6379:6379 redis:8
docker run -d --name cassandra -p 9042:9042 cassandra:4.1
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:5
```

Tambien se documentaron soluciones para:

- Puerto `3001` ocupado.
- Redis ya corriendo.
- Cassandra con `ECONNREFUSED`.
- Cassandra con `OperationTimedOutError`.
- Neo4j con `ECONNREFUSED`.
- `npm error code 130`.

---

## 18. Rutas finales principales

### Productos

```http
GET    /api/products
GET    /api/products/:id
POST   /api/products/:id/view
GET    /api/products/analytics/top
GET    /api/products/analytics/top-sold
```

### Pedidos

```http
POST   /api/orders
GET    /api/orders/mine
GET    /api/orders
PUT    /api/orders/:id/status
```

### Carrito

```http
GET    /api/orders/cart
POST   /api/orders/cart
DELETE /api/orders/cart
```

### Recomendaciones

```http
GET    /api/recommendations
```

### Recorrido del cliente

```http
GET    /api/customer-journey
```

### Kit

```http
GET    /api/kit-builder
```

---

## 19. Consultas requeridas por el TP cubiertas

### Cassandra

Se cubrieron:

- Mas de 2 tablas desnormalizadas.
- Partition keys y clustering columns documentadas.
- Mas de 8 consultas CQL.
- TTL en carrito.
- Coleccion en Cassandra: `list<frozen<map<text,text>>>`.
- Counters: `product_views` y `product_sales`.
- Batch: creacion de pedido en varias tablas.
- Prepared statements en `execute()` y `batch()`.

### Neo4j

Se cubrieron:

- Nodos conceptuales:
  - `User`
  - `Order`
  - `Product`
  - `Category`
- Relaciones:
  - `COMPRÓ`
  - `CONTIENE`
  - `PERTENECE_A`
  - `COMPLEMENTA`
  - `PURCHASED`
  - `IN_CATEGORY`
- Consultas con traversal:
  - Recomendacion colaborativa.
  - Productos por categoria.
  - Beneficios/descuentos activos.
  - Timeline de pedidos.
  - Kit builder por categorias faltantes.
  - Compras juntas y categorias exploradas representadas en mapas visuales.
- Fallback robusto a MongoDB.

---

## 20. Verificaciones realizadas

Se ejecutaron validaciones durante el desarrollo:

```bash
node --check backend/src/services/kitBuilder.service.js
node --check backend/src/services/recommendation.service.js
node --check backend/src/seed.extra-products.js
```

```bash
cd frontend
npm run build
```

Resultado:

- Frontend compila correctamente.
- TypeScript validado con `npx tsc --noEmit`.
- `git diff --check` sin problemas.

Nota:

- El lint puntual con `npx eslint` no se pudo completar porque la sesion no tenia acceso a npm registry y `npx` intento resolver paquetes por red.

---

## 21. Comandos utiles para levantar servicios

### Backend

```bash
cd "/Users/franciscorodriguezpons/Documents/New project/mate-ecommerce-backend/backend"
npm run dev
```

### Frontend

```bash
cd "/Users/franciscorodriguezpons/Documents/New project/mate-ecommerce-backend/frontend"
npm run dev
```

Frontend:

```text
http://localhost:3001
```

Backend:

```text
http://localhost:3000
```

### Cassandra local

```bash
docker run -d --name cassandra -p 9042:9042 cassandra:4.1
```

Esperar hasta ver en logs:

```txt
Startup complete
```

### Redis local

```bash
docker run -d --name mate-redis -p 6379:6379 redis:8
```

Si se usa Redis local sin Docker:

```bash
redis-server
```

Si aparece `Address already in use`, Redis ya esta corriendo.

### Neo4j local

```bash
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5
```

Debe estar escuchando en:

```text
bolt://127.0.0.1:7687
```

---

## 22. Resultado final

El proyecto quedo con:

- Ecommerce funcional sobre MongoDB.
- Cassandra integrada para pedidos, carrito y analytics.
- Redis usado como cache.
- Neo4j integrado para recomendaciones, recorrido y kit, con fallback.
- Descuentos administrables por producto.
- Frontend enriquecido con:
  - productos mas vistos
  - productos mas vendidos
  - recomendaciones
  - mapas SVG interactivos para favoritos, compras juntas, beneficios y categorias
  - recorrido del matero
  - armador de kit
  - cupon al completar kit
- 10 productos nuevos con imagen, descripcion, stock y precio.
- Stock actualizado para todos los productos.
- Guia `SETUP_INICIAL.md` para levantar el proyecto completo desde cero.

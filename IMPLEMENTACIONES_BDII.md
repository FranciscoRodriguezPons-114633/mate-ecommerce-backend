# Implementacion de Cassandra y Neo4j

Proyecto: `mate-ecommerce-backend`
Materia: Bases de Datos II - UTN FRC
Dominio: e-commerce de productos materos
Stack base: Node.js, Express, MongoDB, Redis, Cassandra, Neo4j y Next.js

---

## 1. Proposito de la implementacion

El proyecto parte de un e-commerce funcional con MongoDB como base principal. Sobre esa base se incorporaron dos bases NoSQL especializadas:

- **Cassandra**, para resolver consultas de alto volumen, escrituras rapidas, datos desnormalizados, counters, TTL y analitica de productos.
- **Neo4j**, para modelar relaciones entre usuarios, pedidos, productos y categorias, permitiendo recomendaciones, recorridos y visualizaciones basadas en grafo.

MongoDB sigue siendo la **fuente de verdad** del sistema: productos, usuarios, pedidos, stock, autenticacion y datos transaccionales principales viven ahi. Cassandra y Neo4j no reemplazan MongoDB; lo complementan para resolver problemas donde una base documental no es la herramienta mas expresiva o eficiente.

La arquitectura final queda asi:

```text
Frontend Next.js
       |
       v
Backend Express
       |
       |-- MongoDB: fuente de verdad
       |-- Redis: cache de consultas frecuentes
       |-- Cassandra: pedidos, carrito, counters y analytics
       |-- Neo4j: recomendaciones, journey, kit y exploracion relacional
```

Tambien se implementaron fallbacks para que la aplicacion no se rompa si Cassandra o Neo4j no estan disponibles.

---

## 2. Por que Cassandra

Cassandra fue incorporada porque el proyecto necesita cubrir escenarios donde conviene leer y escribir datos previamente modelados segun la consulta.

En un e-commerce, hay operaciones que pueden crecer mucho:

- listar pedidos de un usuario;
- listar pedidos por estado para administracion;
- guardar carritos temporales;
- contar vistas de productos;
- contar ventas de productos;
- generar rankings de productos vistos o vendidos.

Estas operaciones encajan bien con Cassandra porque:

- permite **tablas desnormalizadas orientadas a consulta**;
- escala bien en escrituras;
- soporta **TTL** por fila para datos temporales;
- soporta **counter columns** para acumuladores;
- permite usar **BATCH** para escribir la misma entidad en varias tablas;
- evita joins, favoreciendo lecturas directas por partition key.

### Beneficios concretos en el proyecto

| Necesidad | Solucion con Cassandra |
| --- | --- |
| Consultar pedidos por usuario | Tabla `orders_by_user` |
| Consultar pedidos por estado | Tabla `orders_by_status` |
| Obtener items de un pedido | Tabla `order_items` |
| Persistir carrito temporal | Tabla `carts` con TTL |
| Contar vistas de productos | Counter table `product_views` |
| Contar ventas de productos | Counter table `product_sales` |
| Escribir pedido en varias vistas | `client.batch()` |

---

## 3. Por que Neo4j

Neo4j fue incorporado porque varias funcionalidades nuevas no dependen solo de documentos aislados, sino de **relaciones**:

- que compro un usuario;
- que productos aparecen juntos;
- que categorias exploro;
- que productos complementan otros productos;
- que usuarios tienen comportamientos similares;
- que camino existe entre productos relacionados.

En MongoDB estas consultas requeririan multiples queries y cruces manuales en memoria. En Neo4j, esas relaciones se expresan naturalmente con patrones `MATCH`.

### Beneficios concretos en el proyecto

| Necesidad | Solucion con Neo4j |
| --- | --- |
| Recomendaciones colaborativas | Traversal usuario-producto-usuario-producto |
| Productos complementarios | Relacion `COMPLEMENTA` |
| Journey del cliente | Recorrido usuario-pedido-producto-categoria |
| Armador de kit | Categorias compradas vs categorias faltantes |
| Compras frecuentes juntas | Pares de productos contenidos en pedidos |
| Categorias exploradas y pendientes | Traversal sobre categorias compradas |
| Visualizaciones relacionales | Mapas SVG basados en datos del grafo |

---

## 4. Dependencias y configuracion

### Dependencias agregadas

Archivo: `backend/package.json`

```json
"cassandra-driver": "^4.9.0",
"neo4j-driver": "^6.0.1"
```

Scripts relevantes:

```json
"seed:cassandra": "node src/seed.cassandra.js",
"seed:extras": "node src/seed.extra-products.js"
```

### Variables de entorno

Archivo: `backend/.env`

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

Estas variables tambien quedaron documentadas en `backend/.env.example`.

---

## 5. Integracion en Express

Archivo principal:

- `backend/src/app.js`

Se agregaron conexiones a Cassandra y Neo4j junto con las conexiones ya existentes a MongoDB y Redis.

```js
const { connectCassandra } = require("./config/cassandra");
const { connectNeo4j } = require("./config/neo4j");
```

La conexion se hace de forma no bloqueante:

```js
connectCassandra().catch((err) => {
  console.error("Failed to connect to Cassandra, continuing without it:", err);
});

connectNeo4j().catch((err) => {
  console.error("Failed to connect to Neo4j, using recommendation fallback:", err.message);
});
```

Decision tecnica:

- MongoDB sigue siendo obligatorio.
- Cassandra y Neo4j son servicios especializados.
- Si fallan, la aplicacion sigue respondiendo usando MongoDB como respaldo.

---

# Parte I - Cassandra

---

## 6. Conexion Cassandra

Archivo:

- `backend/src/config/cassandra.js`

Implementa:

- cliente singleton;
- `connectCassandra()`;
- `isCassandraAvailable()`;
- timeout de conexion;
- retry policy del driver.

Resumen:

```js
const client = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_HOST || "127.0.0.1"],
  localDataCenter: process.env.CASSANDRA_DATACENTER || "datacenter1",
  keyspace: process.env.CASSANDRA_KEYSPACE || "mate_ecommerce",
  socketOptions: { connectTimeout: 5000 },
  policies: {
    retry: new cassandra.policies.retry.RetryPolicy(),
  },
});
```

La funcion `isCassandraAvailable()` permite que los servicios sepan si deben consultar Cassandra o usar fallback.

---

## 7. Modelo Cassandra

Archivo:

- `backend/src/config/cassandra.schema.cql`

Tablas implementadas:

1. `orders_by_user`
2. `orders_by_status`
3. `order_items`
4. `carts`
5. `product_views`
6. `product_sales`

La decision principal fue modelar las tablas segun consultas reales del sistema. En Cassandra no se diseña pensando en normalizacion, sino en los patrones de lectura.

---

## 8. Tabla `orders_by_user`

Uso:

- listar pedidos de un usuario autenticado.

Schema:

```cql
CREATE TABLE IF NOT EXISTS orders_by_user (
  user_id        text,
  created_at     timestamp,
  order_id       uuid,
  mongo_order_id text,
  status         text,
  total          decimal,
  items          list<frozen<map<text, text>>>,
  PRIMARY KEY (user_id, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

### Justificacion

- **Partition key:** `user_id`.
- **Clustering column:** `created_at`.
- Todos los pedidos de un usuario quedan agrupados en la misma particion.
- Los pedidos se ordenan del mas nuevo al mas viejo.
- `user_id` es `text` porque en MongoDB el usuario es un `ObjectId`, no un UUID.

### Consulta principal

```cql
SELECT order_id, mongo_order_id, created_at, status, total, items
FROM orders_by_user
WHERE user_id = ?;
```

---

## 9. Tabla `orders_by_status`

Uso:

- vista administrativa de pedidos por estado.

Schema:

```cql
CREATE TABLE IF NOT EXISTS orders_by_status (
  status         text,
  created_at     timestamp,
  order_id       uuid,
  mongo_order_id text,
  user_id        text,
  user_name      text,
  user_email     text,
  total          decimal,
  PRIMARY KEY (status, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

### Justificacion

- **Partition key:** `status`.
- **Clustering column:** `created_at`.
- Permite consultar rapidamente pedidos `pending`, `paid`, `shipped`, `delivered` o `cancelled`.
- Es una tabla desnormalizada: repite datos de usuario para evitar joins.

### Consulta principal

```cql
SELECT order_id, mongo_order_id, created_at, status, user_id, user_name, user_email, total
FROM orders_by_status
WHERE status = ?;
```

---

## 10. Tabla `order_items`

Uso:

- consultar los items de un pedido.

Schema:

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

### Justificacion

- **Partition key:** `order_id`.
- **Clustering key:** `product_id`.
- Todos los productos de un pedido quedan juntos.

### Consulta principal

```cql
SELECT product_id, name, price, quantity, subtotal, image
FROM order_items
WHERE order_id = ?;
```

---

## 11. Tabla `carts`

Uso:

- persistir carritos temporales por usuario.

Schema:

```cql
CREATE TABLE IF NOT EXISTS carts (
  user_id     text PRIMARY KEY,
  items       list<frozen<map<text, text>>>,
  updated_at  timestamp
);
```

### Conceptos aplicados

- **TTL:** el carrito expira automaticamente.
- **Coleccion:** `items` usa `list<frozen<map<text, text>>>`.
- **Partition key:** `user_id`.

### Guardado con TTL

```cql
INSERT INTO carts (user_id, items, updated_at)
VALUES (?, ?, ?)
USING TTL 604800;
```

`604800` segundos equivale a 7 dias.

### Consultas

```cql
SELECT items, updated_at
FROM carts
WHERE user_id = ?;
```

```cql
DELETE FROM carts
WHERE user_id = ?;
```

---

## 12. Tablas counter

Cassandra tiene un tipo especial de columna para contadores. Se uso para vistas y ventas.

### `product_views`

```cql
CREATE TABLE IF NOT EXISTS product_views (
  product_id  text PRIMARY KEY,
  views       counter
);
```

Incremento:

```cql
UPDATE product_views
SET views = views + 1
WHERE product_id = ?;
```

Lectura:

```cql
SELECT views
FROM product_views
WHERE product_id = ?;
```

Ranking:

```cql
SELECT product_id, views
FROM product_views
LIMIT ?;
```

Luego se ordena en memoria por `views DESC`.

### `product_sales`

```cql
CREATE TABLE IF NOT EXISTS product_sales (
  product_id  text PRIMARY KEY,
  sales       counter
);
```

Incremento:

```cql
UPDATE product_sales
SET sales = sales + ?
WHERE product_id = ?;
```

Lectura:

```cql
SELECT sales
FROM product_sales
WHERE product_id = ?;
```

Ranking:

```cql
SELECT product_id, sales
FROM product_sales
LIMIT ?;
```

Luego se ordena en memoria por `sales DESC`.

---

## 13. Escritura de pedidos con BATCH

Servicio:

- `backend/src/services/order.cassandra.service.js`

Funcion:

- `createOrderInCassandra()`

Cuando se crea un pedido, Cassandra recibe una escritura desnormalizada en varias tablas.

Queries:

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

Ejecucion:

```js
client.batch(queries, { prepare: true });
```

### Beneficio

Un mismo pedido queda preparado para multiples consultas:

- por usuario;
- por estado;
- por items.

Esta duplicacion es intencional y responde al modelo de Cassandra.

---

## 14. Actualizacion de estado en Cassandra

Cassandra no permite actualizar eficientemente una fila si no se tiene la partition key adecuada. Para cambiar un pedido de estado se implemento una estrategia de mover fila entre particiones.

Proceso:

1. Buscar la fila anterior en `orders_by_status`.
2. Borrar la fila del estado viejo.
3. Actualizar estado en `orders_by_user`.
4. Insertar la fila en el nuevo estado.

Consultas:

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

---

## 15. Integracion de Cassandra en la aplicacion

Archivos principales:

- `backend/src/config/cassandra.js`
- `backend/src/config/cassandra.schema.cql`
- `backend/src/seed.cassandra.js`
- `backend/src/services/order.cassandra.service.js`
- `backend/src/services/cart.service.js`
- `backend/src/services/analytics.service.js`
- `backend/src/services/sales.analytics.service.js`
- `backend/src/controllers/cart.controller.js`
- `backend/src/controllers/analytics.controller.js`

Flujo de pedidos:

1. MongoDB crea el pedido y actualiza stock.
2. Cassandra guarda las vistas desnormalizadas.
3. Cassandra incrementa counters de ventas.
4. Redis invalida rankings cacheados.
5. Si Cassandra falla, el pedido no se pierde porque MongoDB es la fuente de verdad.

Rutas relacionadas:

```http
POST   /api/orders
GET    /api/orders/mine
GET    /api/orders
PUT    /api/orders/:id/status
GET    /api/orders/cart
POST   /api/orders/cart
DELETE /api/orders/cart
POST   /api/products/:id/view
GET    /api/products/analytics/top
GET    /api/products/analytics/top-sold
```

---

# Parte II - Neo4j

---

## 16. Conexion Neo4j

Archivo:

- `backend/src/config/neo4j.js`

Implementa:

- driver oficial `neo4j-driver`;
- `connectNeo4j()`;
- `closeNeo4j()`;
- `isNeo4jAvailable()`.

Conexion:

```js
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
```

La aplicacion verifica conectividad al iniciar. Si Neo4j no responde, se activa fallback a MongoDB para recomendaciones, kit y recorrido.

---

## 17. Modelo de grafo

Modelo conceptual usado para el TP:

```text
(User)-[:COMPRÓ]->(Order)-[:CONTIENE {cantidad}]->(Product)-[:PERTENECE_A]->(Category)
(Product)-[:COMPLEMENTA]->(Product)
```

Propiedades principales:

```text
User:    { id, nombre, email }
Order:   { id, fecha, total, estado }
Product: { id, nombre, imageUrl, precio, precioOriginal?, descuento? }
Category:{ id, nombre }
```

Tambien se soporta un modelo equivalente en ingles para compatibilidad con algunos servicios:

```text
(User)-[:PURCHASED]->(Product)-[:IN_CATEGORY]->(Category)
```

### Por que este modelo

El grafo permite expresar preguntas del negocio como caminos:

- "usuarios similares a este cliente";
- "productos que suelen comprarse juntos";
- "productos complementarios";
- "categorias exploradas";
- "categorias pendientes";
- "recorrido de compras del usuario".

En una base documental esto exige multiples consultas y joins manuales. En Neo4j, el recorrido es parte natural del motor.

---

## 18. Relacion `COMPLEMENTA`

Archivo:

- `backend/src/config/neo4j.seed.cypher`

Esta relacion conecta productos que se usan juntos en un set matero.

Ejemplos:

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

Beneficio:

- habilita recomendaciones de productos complementarios;
- permite construir el armador de kit;
- permite sugerir combos;
- permite mostrar relaciones visuales en frontend.

---

## 19. Motor de recomendaciones

Archivos:

- `backend/src/services/recommendation.service.js`
- `backend/src/controllers/recommendation.controller.js`
- `backend/src/routes/recommendation.routes.js`
- `frontend/app/recomendaciones/page.tsx`

Ruta:

```http
GET /api/recommendations?limit=8
```

### Recomendacion colaborativa

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

- buscar usuarios que compraron productos parecidos;
- descubrir productos que esos usuarios tambien compraron;
- evitar recomendar productos ya comprados por el cliente.

### Productos por categoria relacionada

```cypher
MATCH (me:User {id: $userId})-[:PURCHASED]->(:Product)-[:IN_CATEGORY]->(category:Category)
MATCH (category)<-[:IN_CATEGORY]-(candidate:Product)
WHERE NOT (me)-[:PURCHASED]->(candidate)
RETURN candidate, category
LIMIT $limit;
```

Objetivo:

- recomendar productos de categorias cercanas al historial del usuario.

### Beneficios activos

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

Objetivo:

- alimentar el mapa de beneficios;
- mostrar productos con descuentos cargados desde admin;
- combinar informacion de Neo4j con MongoDB.

### Detalle tecnico: `LIMIT` como entero Neo4j

Neo4j exige un entero para `LIMIT`. El driver recibia `8.0` y fallaba. Se corrigio con:

```js
const toNeo4jLimit = (limit, fallback = 8) => {
  const parsedLimit = Number(limit);
  const safeLimit = Number.isFinite(parsedLimit) && parsedLimit >= 0
    ? Math.trunc(parsedLimit)
    : fallback;

  return neo4j.int(safeLimit);
};
```

---

## 20. Recorrido del matero

Archivos:

- `backend/src/services/customerJourney.service.js`
- `backend/src/controllers/customerJourney.controller.js`
- `backend/src/routes/customerJourney.routes.js`
- `frontend/app/mi-recorrido/page.tsx`

Ruta:

```http
GET /api/customer-journey
```

Consulta conceptual:

```cypher
MATCH (u:User {id: $userId})-[:COMPRÓ]->(o:Order)-[:CONTIENE]->(p:Product)-[:PERTENECE_A]->(c:Category)
RETURN o.id AS orderId,
       o.fecha AS fecha,
       o.total AS total,
       o.estado AS estado,
       collect({
         id: p.id,
         nombre: p.nombre,
         imagen: p.imageUrl,
         categoria: c.nombre
       }) AS productos
ORDER BY fecha ASC;
```

La respuesta se transforma en:

- timeline de compras;
- categorias nuevas descubiertas;
- total de pedidos;
- producto mas comprado;
- progreso por categorias;
- prediccion de proxima categoria.

Niveles del usuario:

```text
1 categoria  -> Iniciado
2 categorias -> Aprendiz
3 categorias -> Conocedor
4 categorias -> Matero
5 categorias -> Maestro matero
```

Beneficio:

- transforma el historial de compras en una experiencia entendible para el cliente;
- usa el grafo para mostrar evolucion y no solo una tabla de pedidos.

---

## 21. Armador de kit matero

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

Categorias fijas:

```js
["Yerba", "Calabazas", "Bombillas", "Termos", "Yerberas"]
```

Consulta conceptual:

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

Logica:

1. Detectar categorias compradas.
2. Detectar categorias faltantes.
3. Recomendar productos para completar el kit.
4. Calcular progreso.
5. Entregar cupon si el kit esta completo.

Cupon:

```json
{
  "code": "MATERO10",
  "message": "Felicitaciones, completaste tu kit y te ganaste un cupón.",
  "discount": 10
}
```

Ubicacion final:

- El kit se muestra dentro de `/recomendaciones`.
- `/kit-armador` redirecciona a `/recomendaciones` para no duplicar experiencia.

---

## 22. Mapas visuales basados en Neo4j

En `/recomendaciones` se reemplazo la vista tecnica del grafo por mapas visuales pensados para usuario final. No se usan D3 ni Cytoscape: son SVG dinamicos generados en React.

### Estilo compartido

- Fondo externo: `#F5EDD8`.
- Fondo interno: `#E8D9BE`.
- Nodo central: gradiente `#D4793A -> #7A3010`.
- Conectores: `#9A6030` con `stroke-dasharray`.
- Stats: fondo `#EDE0CC`, borde `#C8A882`.
- Animaciones:
  - `pulse-ring`;
  - `glow-center`;
  - `float-node`.

### Mapa de favoritos

Representa:

- productos repetidos por el usuario;
- sugerencias cercanas para recompra.

Elementos:

- badge `repite`;
- badge `sugiere`;
- nodo central con nombre del usuario;
- corazon clickeable en el header que se rellena visualmente.

### Mapa de compras juntas

Representa:

- productos que el usuario compra juntos;
- combos populares sugeridos.

Elementos:

- linea doble entre pares;
- badge `juntos`;
- badge `combo popular`;
- tooltip con detalle y link al producto.

### Mapa de beneficios

Representa:

- productos con descuento activo.

Elementos:

- badge `-X%`;
- borde mas grueso para descuentos de 50% o mas;
- tooltip con precio actual, precio original y ahorro.

### Mapa de categorias

Representa:

- categorias exploradas;
- categorias pendientes.

Elementos:

- nodos verdes para categorias compradas;
- nodos beige punteados para categorias no exploradas;
- tooltip con producto destacado;
- boton `Ver categoría`;
- cierre con `x`;
- posicionamiento seguro del tooltip para que no tape la informacion.

### Ajuste UX

Se elimino de la interfaz el cartel:

```text
Modo respaldo
```

La razon es que era util para debug, pero no para el usuario final. El fallback sigue existiendo internamente.

---

# Parte III - Aplicacion funcional en el ecommerce

---

## 23. Descuentos administrables

Se agrego soporte de descuentos por producto desde el panel administrador.

Modelo:

- `backend/src/models/Product.js`

Campo:

```js
discountPercentage: {
  type: Number,
  default: 0,
  min: 0,
  max: 90,
}
```

Validaciones:

- `backend/src/middlewares/validateProductSchema.js`;
- `backend/src/utils/productValidators.js`;
- `backend/src/services/product.service.js`.

Aplicacion:

- admin puede cargar descuentos;
- el catalogo muestra precio final y precio original tachado;
- el detalle de producto respeta descuentos;
- el checkout calcula subtotales con descuento;
- el mapa de beneficios usa esos datos.

---

## 24. Analytics visuales

Componentes:

- `frontend/components/top-viewed-products.tsx`;
- `frontend/components/top-sold-nodes.tsx`.

### Mas vistos

Endpoint:

```http
GET /api/products/analytics/top
```

Fuente:

- Cassandra `product_views`.

Visual:

- cards de productos;
- vistas acumuladas;
- link al detalle.

### Mas vendidos

Endpoint:

```http
GET /api/products/analytics/top-sold
```

Fuente:

- Cassandra `product_sales`.

Visual:

- nodos circulares;
- mas ventas = nodo mas grande;
- link al producto si tiene `_id` real de MongoDB.

---

## 25. Productos extra y stock

Archivo:

- `backend/src/seed.extra-products.js`

Se agregaron 10 productos nuevos con:

- nombre;
- descripcion;
- precio;
- stock;
- categoria;
- imagen propia.

Productos:

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

Imagenes generadas en `frontend/public/`:

- `product-mate-camionero-cuero.jpg`
- `product-mate-torpedo-negro.jpg`
- `product-bombilla-pico-plano.jpg`
- `product-bombilla-resorte.jpg`
- `product-yerba-barbacua.jpg`
- `product-yerba-hierbas.jpg`
- `product-termo-negro-12.jpg`
- `product-yerbera-cuero.jpg`
- `product-set-viajero.jpg`
- `product-cepillo-bombilla.jpg`

---

## 26. Redis como cache complementario

Redis se usa para cachear rankings y consultas frecuentes.

Casos:

- productos mas vistos;
- productos mas vendidos;
- cache de productos.

Cuando se registra una venta, se invalidan caches relacionadas:

```js
const cacheKeys = await redisClient.keys("analytics:top-sold-products:*");
if (cacheKeys.length) {
  await redisClient.del(cacheKeys);
}
```

Redis mejora performance pero no es fuente de verdad. Si Redis falla, la aplicacion sigue funcionando sin cache.

---

## 27. Archivos principales modificados o creados

### Cassandra

- `backend/src/config/cassandra.js`
- `backend/src/config/cassandra.schema.cql`
- `backend/src/seed.cassandra.js`
- `backend/src/services/order.cassandra.service.js`
- `backend/src/services/cart.service.js`
- `backend/src/services/analytics.service.js`
- `backend/src/services/sales.analytics.service.js`
- `backend/src/controllers/cart.controller.js`
- `backend/src/controllers/analytics.controller.js`

### Neo4j

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

### Frontend

- `frontend/app/recomendaciones/page.tsx`
- `frontend/app/mi-recorrido/page.tsx`
- `frontend/app/kit-armador/page.tsx`
- `frontend/components/mate-kit-builder.tsx`
- `frontend/components/top-viewed-products.tsx`
- `frontend/components/top-sold-nodes.tsx`
- `frontend/components/product-card.tsx`
- `frontend/app/admin/page.tsx`
- `frontend/lib/api.ts`

### Documentacion

- `IMPLEMENTACIONES_BDII.md`
- `SETUP_INICIAL.md`

---

## 28. Rutas relevantes

### Cassandra / analytics / carrito

```http
POST   /api/orders
GET    /api/orders/mine
GET    /api/orders
PUT    /api/orders/:id/status
GET    /api/orders/cart
POST   /api/orders/cart
DELETE /api/orders/cart
POST   /api/products/:id/view
GET    /api/products/analytics/top
GET    /api/products/analytics/top-sold
```

### Neo4j / recomendaciones

```http
GET    /api/recommendations
GET    /api/customer-journey
GET    /api/kit-builder
```

---

## 29. Como levantar las bases

El setup completo esta documentado en:

- `SETUP_INICIAL.md`

Comandos principales:

```bash
docker run -d --name mate-mongo -p 27017:27017 mongo:7
docker run -d --name mate-redis -p 6379:6379 redis:8
docker run -d --name cassandra -p 9042:9042 cassandra:4.1
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:5
```

Verificar Cassandra:

```bash
docker logs cassandra --tail 30
```

Esperar:

```text
Startup complete
```

Verificar Neo4j:

```bash
docker logs neo4j --tail 30
```

Esperar:

```text
Started.
```

Seeds:

```bash
cd backend
node src/seed.js
npm run seed:extras
npm run seed:cassandra
cd ..
docker exec -i neo4j cypher-shell -u neo4j -p password < backend/src/config/neo4j.seed.cypher
```

---

## 30. Cobertura de requisitos del TP

### Cassandra

| Requisito | Implementacion |
| --- | --- |
| Minimo 2 tablas desnormalizadas | `orders_by_user`, `orders_by_status`, `order_items`, `carts`, `product_views`, `product_sales` |
| Partition key y clustering columns | Documentadas por tabla |
| 8 consultas CQL | Superadas: pedidos, estados, items, carrito, vistas, ventas |
| TTL | `carts` con `USING TTL 604800` |
| Coleccion | `list<frozen<map<text, text>>>` |
| Counter | `product_views`, `product_sales` |
| Batch | Creacion de pedido en varias tablas |
| Prepared statements | `prepare: true` en `execute()` y `batch()` |

### Neo4j

| Requisito | Implementacion |
| --- | --- |
| Nodos | `User`, `Order`, `Product`, `Category` |
| Relaciones | `COMPRÓ`, `CONTIENE`, `PERTENECE_A`, `COMPLEMENTA`, `PURCHASED`, `IN_CATEGORY` |
| Traversals | recomendaciones, kit, journey, categorias |
| Relaciones con propiedades | `CONTIENE {cantidad}`, `PURCHASED {quantity}` |
| Consultas complejas | colaborativas, categorias faltantes, compras juntas, beneficios |
| Visualizacion | mapas SVG interactivos en `/recomendaciones` |

---

## 31. Resultado final

El proyecto quedo con:

- MongoDB como fuente de verdad.
- Cassandra para pedidos desnormalizados, carrito con TTL, counters y analytics.
- Neo4j para recomendaciones, recorrido del usuario, kit matero y mapas relacionales.
- Redis para cache.
- Fallbacks para mantener la app disponible aunque Cassandra o Neo4j fallen.
- Panel admin con descuentos.
- Frontend enriquecido con:
  - productos mas vistos;
  - productos mas vendidos;
  - recomendaciones;
  - mapa de favoritos;
  - mapa de compras juntas;
  - mapa de beneficios;
  - mapa de categorias;
  - recorrido del matero;
  - armador de kit;
  - cupon al completar el kit.

La implementacion no solo agrega tecnologias, sino que las aplica a problemas donde cada una aporta valor real:

- Cassandra aporta velocidad, desnormalizacion y escritura eficiente.
- Neo4j aporta expresividad relacional y recorridos complejos.
- MongoDB conserva consistencia funcional como base principal.
- Redis reduce costo de consultas frecuentes.

-- Crear keyspace (ejecutar una sola vez como superusuario)
CREATE KEYSPACE IF NOT EXISTS mate_ecommerce
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE mate_ecommerce;

-- Tabla 1: pedidos por usuario
-- Partition key: user_id (texto del ObjectId Mongo; todos los pedidos de un usuario en el mismo nodo)
-- Clustering key: created_at DESC (ordenados del mas reciente al mas antiguo)
-- Uso: getMyOrders(userId)
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

-- Tabla 2: pedidos por estado (desnormalizacion para vista de admin)
-- Partition key: status (agrupa por estado para filtros del admin)
-- Clustering key: created_at DESC
-- Uso: getAllOrders() filtrado por status
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

-- Tabla 3: items de un pedido
-- Partition key: order_id (todos los items de un pedido juntos)
-- Clustering key: product_id
-- Uso: getOrderItems(orderId)
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

-- Tabla 4: carrito de usuario con TTL
-- Partition key: user_id (un carrito por usuario, usando el ObjectId Mongo como texto)
-- Sin clustering key: un solo row por usuario
-- Nota: TTL se aplica al INSERT (604800 segundos = 7 dias)
-- Uso: saveCart(userId, items), getCart(userId)
CREATE TABLE IF NOT EXISTS carts (
  user_id     text PRIMARY KEY,
  items       list<frozen<map<text, text>>>,
  updated_at  timestamp
);

-- Tabla 5: vistas de productos (counter table)
-- Partition key: product_id
-- Nota: las counter tables solo pueden tener counters como columnas no-PK
-- Uso: incrementProductView(productId), getTopProducts()
CREATE TABLE IF NOT EXISTS product_views (
  product_id  text PRIMARY KEY,
  views       counter
);

-- Tabla 6: productos mas vendidos (counter table)
-- Partition key: product_id
-- Nota: las counter tables solo pueden tener counters como columnas no-PK
-- Uso: incrementProductSales(productId, quantity), getTopSoldProducts()
CREATE TABLE IF NOT EXISTS product_sales (
  product_id  text PRIMARY KEY,
  sales       counter
);

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const cassandra = require("cassandra-driver");

const keyspace = process.env.CASSANDRA_KEYSPACE || "mate_ecommerce";
const contactPoints = [process.env.CASSANDRA_HOST || "127.0.0.1"];
const localDataCenter = process.env.CASSANDRA_DATACENTER || "datacenter1";

const toDecimal = (value) =>
  cassandra.types.BigDecimal.fromString(String(value || 0));

const productCatalog = {
  "mate-imperial": {
    name: "Mate Imperial con Virola de Alpaca",
    price: 18500,
    category: "Calabazas",
    image: "/product-mate-1.jpg",
  },
  "bombilla-cincelada": {
    name: "Bombilla Cincelada de Alpaca",
    price: 8900,
    category: "Bombillas",
    image: "/product-bombilla-1.jpg",
  },
  "yerba-premium": {
    name: "Yerba Mate Premium Organica 1kg",
    price: 4500,
    category: "Yerba Mate",
    image: "/product-yerba-1.jpg",
  },
  "set-matero-premium": {
    name: "Set Completo Matero Premium",
    price: 45000,
    category: "Sets",
    image: "/product-set-1.jpg",
  },
  "mate-algarrobo": {
    name: "Mate de Algarrobo Tallado",
    price: 24000,
    category: "Calabazas",
    image: "/product-mate-2.jpg",
  },
  "termo-acero": {
    name: "Termo Matero de Acero 1L",
    price: 28000,
    category: "Accesorios",
    image: "/product-termo-1.jpg",
  },
  "bombilla-pico-loro": {
    name: "Bombilla Pico de Loro Acero",
    price: 3500,
    category: "Bombillas",
    image: "/product-bombilla-1.jpg",
  },
  "yerba-suave": {
    name: "Yerba Mate Suave Sin Palo 500g",
    price: 2800,
    category: "Yerba Mate",
    image: "/product-yerba-1.jpg",
  },
};

const users = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Carlos Rodriguez",
    email: "carlos@example.com",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Maria Gonzalez",
    email: "maria@example.com",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Juan Perez",
    email: "juan@example.com",
  },
];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const makeItems = (items) =>
  items.map(({ productId, quantity }) => {
    const product = productCatalog[productId];
    const subtotal = product.price * quantity;

    return {
      product_id: productId,
      name: product.name,
      price: product.price,
      quantity,
      subtotal,
      image: product.image,
    };
  });

const orders = [
  { user: users[0], status: "pending", days: 1, items: makeItems([{ productId: "mate-imperial", quantity: 1 }, { productId: "yerba-premium", quantity: 2 }]) },
  { user: users[1], status: "pending", days: 2, items: makeItems([{ productId: "bombilla-cincelada", quantity: 1 }, { productId: "yerba-suave", quantity: 3 }]) },
  { user: users[2], status: "pending", days: 4, items: makeItems([{ productId: "termo-acero", quantity: 1 }]) },
  { user: users[0], status: "paid", days: 5, items: makeItems([{ productId: "set-matero-premium", quantity: 1 }]) },
  { user: users[1], status: "paid", days: 7, items: makeItems([{ productId: "mate-algarrobo", quantity: 1 }, { productId: "bombilla-pico-loro", quantity: 2 }]) },
  { user: users[2], status: "paid", days: 8, items: makeItems([{ productId: "yerba-premium", quantity: 4 }]) },
  { user: users[0], status: "paid", days: 10, items: makeItems([{ productId: "termo-acero", quantity: 1 }, { productId: "mate-imperial", quantity: 1 }]) },
  { user: users[1], status: "shipped", days: 12, items: makeItems([{ productId: "set-matero-premium", quantity: 1 }, { productId: "yerba-suave", quantity: 2 }]) },
  { user: users[2], status: "shipped", days: 14, items: makeItems([{ productId: "bombilla-cincelada", quantity: 2 }]) },
  { user: users[0], status: "shipped", days: 16, items: makeItems([{ productId: "mate-algarrobo", quantity: 1 }]) },
  { user: users[1], status: "delivered", days: 19, items: makeItems([{ productId: "mate-imperial", quantity: 1 }, { productId: "bombilla-cincelada", quantity: 1 }]) },
  { user: users[2], status: "delivered", days: 23, items: makeItems([{ productId: "yerba-premium", quantity: 2 }, { productId: "bombilla-pico-loro", quantity: 1 }]) },
  { user: users[0], status: "cancelled", days: 25, items: makeItems([{ productId: "set-matero-premium", quantity: 1 }]) },
  { user: users[1], status: "paid", days: 27, items: makeItems([{ productId: "termo-acero", quantity: 1 }, { productId: "yerba-suave", quantity: 5 }]) },
  { user: users[2], status: "shipped", days: 29, items: makeItems([{ productId: "mate-algarrobo", quantity: 1 }, { productId: "yerba-premium", quantity: 1 }]) },
];

const productViews = {
  "mate-imperial": 247,
  "bombilla-cincelada": 189,
  "yerba-premium": 312,
  "set-matero-premium": 156,
  "mate-algarrobo": 203,
  "termo-acero": 178,
  "bombilla-pico-loro": 134,
  "yerba-suave": 267,
};

const productSales = {
  "mate-imperial": 84,
  "bombilla-cincelada": 62,
  "yerba-premium": 96,
  "set-matero-premium": 48,
  "mate-algarrobo": 71,
  "termo-acero": 55,
  "bombilla-pico-loro": 39,
  "yerba-suave": 67,
};

const toItemMap = (item) => ({
  product_id: String(item.product_id),
  name: String(item.name),
  price: String(item.price),
  quantity: String(item.quantity),
  subtotal: String(item.subtotal),
  image: String(item.image || ""),
});

const executeSchema = async () => {
  const schemaPath = path.join(__dirname, "config", "cassandra.schema.cql");
  const schema = fs
    .readFileSync(schemaPath, "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  const adminClient = new cassandra.Client({ contactPoints, localDataCenter });
  await adminClient.connect();

  for (const statement of statements) {
    if (statement.toUpperCase().startsWith("USE ")) continue;
    if (statement.toUpperCase().startsWith("CREATE TABLE")) continue;
    await adminClient.execute(statement);
  }

  await adminClient.shutdown();

  const keyspaceClient = new cassandra.Client({
    contactPoints,
    localDataCenter,
    keyspace,
  });
  await keyspaceClient.connect();

  for (const statement of statements) {
    if (statement.toUpperCase().startsWith("CREATE TABLE")) {
      await keyspaceClient.execute(statement);
    }
  }

  return keyspaceClient;
};

const clearTables = async (client) => {
  const tables = [
    "orders_by_user",
    "orders_by_status",
    "order_items",
    "carts",
    "product_views",
    "product_sales",
  ];

  for (const table of tables) {
    await client.execute(`TRUNCATE ${table}`);
  }
};

const insertOrders = async (client) => {
  let itemCount = 0;

  for (const order of orders) {
    const orderId = cassandra.types.Uuid.random();
    const createdAt = daysAgo(order.days);
    const total = order.items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemMaps = order.items.map(toItemMap);
    itemCount += order.items.length;

    const batch = [
      {
        query: `INSERT INTO orders_by_user
          (user_id, created_at, order_id, mongo_order_id, status, total, items)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [order.user.id, createdAt, orderId, null, order.status, toDecimal(total), itemMaps],
      },
      {
        query: `INSERT INTO orders_by_status
          (status, created_at, order_id, mongo_order_id, user_id, user_name, user_email, total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          order.status,
          createdAt,
          orderId,
          null,
          order.user.id,
          order.user.name,
          order.user.email,
          toDecimal(total),
        ],
      },
      ...order.items.map((item) => ({
        query: `INSERT INTO order_items
          (order_id, product_id, name, price, quantity, subtotal, image)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [
          orderId,
          item.product_id,
          item.name,
          toDecimal(item.price),
          item.quantity,
          toDecimal(item.subtotal),
          item.image,
        ],
      })),
    ];

    await client.batch(batch, { prepare: true });
  }

  return itemCount;
};

const insertCarts = async (client) => {
  const carts = [
    {
      userId: users[0].id,
      items: makeItems([{ productId: "mate-imperial", quantity: 1 }]),
    },
    {
      userId: users[1].id,
      items: makeItems([{ productId: "yerba-suave", quantity: 2 }]),
    },
    {
      userId: users[2].id,
      items: makeItems([{ productId: "bombilla-pico-loro", quantity: 1 }]),
    },
  ];

  for (const cart of carts) {
    await client.execute(
      `INSERT INTO carts (user_id, items, updated_at)
       VALUES (?, ?, ?)
       USING TTL 604800`,
      [cart.userId, cart.items.map(toItemMap), new Date()],
      { prepare: true }
    );
  }

  return carts.length;
};

const insertProductViews = async (client) => {
  for (const [productId, views] of Object.entries(productViews)) {
    await client.execute(
      "UPDATE product_views SET views = views + ? WHERE product_id = ?",
      [cassandra.types.Long.fromNumber(views), productId],
      { prepare: true }
    );
  }

  return Object.keys(productViews).length;
};

const insertProductSales = async (client) => {
  for (const [productId, sales] of Object.entries(productSales)) {
    await client.execute(
      "UPDATE product_sales SET sales = sales + ? WHERE product_id = ?",
      [cassandra.types.Long.fromNumber(sales), productId],
      { prepare: true }
    );
  }

  return Object.keys(productSales).length;
};

const seed = async () => {
  let client;

  try {
    client = await executeSchema();
    await clearTables(client);

    const itemCount = await insertOrders(client);
    const cartCount = await insertCarts(client);
    const productViewCount = await insertProductViews(client);
    const productSalesCount = await insertProductSales(client);

    console.log("Seed Cassandra finalizado");
    console.log(`Pedidos insertados: ${orders.length}`);
    console.log(`Items de pedido insertados: ${itemCount}`);
    console.log(`Carritos insertados: ${cartCount}`);
    console.log(`Counters de productos inicializados: ${productViewCount}`);
    console.log(`Counters de ventas inicializados: ${productSalesCount}`);
  } catch (error) {
    console.error("Error en seed Cassandra:", error.message);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.shutdown();
    }
  }
};

seed();

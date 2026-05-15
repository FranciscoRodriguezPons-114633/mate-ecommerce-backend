const cassandra = require("cassandra-driver");
const { client } = require("../config/cassandra");

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const toDecimal = (value) =>
  cassandra.types.BigDecimal.fromString(String(value || 0));

const decimalToNumber = (value) => (value ? Number(value.toString()) : 0);

const toItemMap = (item) => ({
  product_id: String(item.product || item.product_id || ""),
  name: String(item.name || ""),
  price: String(item.price || 0),
  quantity: String(item.quantity || 0),
  subtotal: String(item.subtotal || 0),
  image: String(item.image || ""),
});

const parseItemMap = (item) => ({
  product: item.product_id,
  product_id: item.product_id,
  name: item.name,
  price: Number(item.price || 0),
  quantity: Number(item.quantity || 0),
  subtotal: Number(item.subtotal || 0),
  image: item.image || "",
});

const mapOrderByUser = (row) => ({
  _id: row.mongo_order_id || (row.order_id ? row.order_id.toString() : undefined),
  order_id: row.order_id ? row.order_id.toString() : undefined,
  mongo_order_id: row.mongo_order_id,
  createdAt: row.created_at,
  created_at: row.created_at,
  status: row.status,
  total: decimalToNumber(row.total),
  items: (row.items || []).map(parseItemMap),
});

const mapOrderByStatus = (row) => ({
  _id: row.mongo_order_id || (row.order_id ? row.order_id.toString() : undefined),
  order_id: row.order_id ? row.order_id.toString() : undefined,
  mongo_order_id: row.mongo_order_id,
  createdAt: row.created_at,
  created_at: row.created_at,
  status: row.status,
  user: {
    _id: row.user_id,
    name: row.user_name,
    email: row.user_email,
  },
  user_id: row.user_id,
  user_name: row.user_name,
  user_email: row.user_email,
  total: decimalToNumber(row.total),
});

const createOrderInCassandra = async (
  userId,
  items,
  total,
  orderItems,
  userName,
  userEmail,
  createdAtOverride,
  mongoOrderId
) => {
  try {
    const orderId = cassandra.types.Uuid.random();
    const createdAt = createdAtOverride ? new Date(createdAtOverride) : new Date();
    const status = "pending";
    const cassandraItems = (orderItems || items || []).map(toItemMap);

    const queries = [
      {
        query: `INSERT INTO orders_by_user
          (user_id, created_at, order_id, mongo_order_id, status, total, items)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [
          String(userId),
          createdAt,
          orderId,
          mongoOrderId ? String(mongoOrderId) : null,
          status,
          toDecimal(total),
          cassandraItems,
        ],
      },
      {
        query: `INSERT INTO orders_by_status
          (status, created_at, order_id, mongo_order_id, user_id, user_name, user_email, total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          status,
          createdAt,
          orderId,
          mongoOrderId ? String(mongoOrderId) : null,
          String(userId),
          userName || "",
          userEmail || "",
          toDecimal(total),
        ],
      },
      ...(orderItems || []).map((item) => ({
        query: `INSERT INTO order_items
          (order_id, product_id, name, price, quantity, subtotal, image)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [
          orderId,
          String(item.product || item.product_id),
          item.name,
          toDecimal(item.price),
          Number(item.quantity),
          toDecimal(item.subtotal),
          item.image || "",
        ],
      })),
    ];

    await client.batch(queries, { prepare: true });
    return orderId.toString();
  } catch (error) {
    console.error("Error creando pedido en Cassandra:", error.message);
    throw error;
  }
};

const getOrdersByUser = async (userId) => {
  try {
    const result = await client.execute(
      `SELECT order_id, mongo_order_id, created_at, status, total, items
       FROM orders_by_user
       WHERE user_id = ?`,
      [String(userId)],
      { prepare: true }
    );

    return result.rows.map(mapOrderByUser);
  } catch (error) {
    console.error("Error obteniendo pedidos por usuario en Cassandra:", error.message);
    throw error;
  }
};

const getOrdersByStatus = async (status) => {
  try {
    const result = await client.execute(
      `SELECT order_id, mongo_order_id, created_at, status, user_id, user_name, user_email, total
       FROM orders_by_status
       WHERE status = ?`,
      [status],
      { prepare: true }
    );

    return result.rows.map(mapOrderByStatus);
  } catch (error) {
    console.error("Error obteniendo pedidos por estado en Cassandra:", error.message);
    throw error;
  }
};

const getOrderItems = async (orderId) => {
  try {
    const result = await client.execute(
      `SELECT product_id, name, price, quantity, subtotal, image
       FROM order_items
       WHERE order_id = ?`,
      [cassandra.types.Uuid.fromString(orderId)],
      { prepare: true }
    );

    return result.rows.map((row) => ({
      product_id: row.product_id,
      name: row.name,
      price: decimalToNumber(row.price),
      quantity: row.quantity,
      subtotal: decimalToNumber(row.subtotal),
      image: row.image,
    }));
  } catch (error) {
    console.error("Error obteniendo items del pedido en Cassandra:", error.message);
    throw error;
  }
};

const updateOrderStatusInCassandra = async (
  orderId,
  oldStatus,
  newStatus,
  createdAt
) => {
  try {
    const createdAtDate = new Date(createdAt);
    const result = await client.execute(
      `SELECT order_id, mongo_order_id, created_at, user_id, user_name, user_email, total
       FROM orders_by_status
       WHERE status = ? AND created_at = ?`,
      [oldStatus, createdAtDate],
      { prepare: true }
    );

    const row = result.rows.find(
      (order) =>
        order.mongo_order_id === String(orderId) ||
        (order.order_id && order.order_id.toString() === String(orderId))
    );

    if (!row) {
      return null;
    }

    await client.batch(
      [
        {
          query: "DELETE FROM orders_by_status WHERE status = ? AND created_at = ?",
          params: [oldStatus, createdAtDate],
        },
        {
          query:
            "UPDATE orders_by_user SET status = ? WHERE user_id = ? AND created_at = ?",
          params: [newStatus, row.user_id, row.created_at],
        },
        {
          query: `INSERT INTO orders_by_status
            (status, created_at, order_id, mongo_order_id, user_id, user_name, user_email, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            newStatus,
            row.created_at,
            row.order_id,
            row.mongo_order_id,
            row.user_id,
            row.user_name,
            row.user_email,
            row.total,
          ],
        },
      ],
      { prepare: true }
    );

    return true;
  } catch (error) {
    console.error("Error actualizando estado en Cassandra:", error.message);
    throw error;
  }
};

const getAllStatuses = async () => {
  try {
    const ordersByStatus = await Promise.all(
      STATUSES.map((status) => getOrdersByStatus(status))
    );

    return ordersByStatus
      .flat()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error("Error obteniendo todos los estados en Cassandra:", error.message);
    throw error;
  }
};

module.exports = {
  createOrderInCassandra,
  getOrdersByUser,
  getOrdersByStatus,
  getOrderItems,
  updateOrderStatusInCassandra,
  getAllStatuses,
};

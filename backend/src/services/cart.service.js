const { client, isCassandraAvailable } = require("../config/cassandra");

const CART_TTL_SECONDS = 604800;

const toCartItemMap = (item) => ({
  product_id: String(item.product || item.product_id || item._id || ""),
  name: String(item.name || ""),
  price: String(item.price || 0),
  quantity: String(item.quantity || 0),
  image: String(item.image || ""),
});

const parseCartItemMap = (item) => ({
  product: item.product_id,
  product_id: item.product_id,
  name: item.name,
  price: Number(item.price || 0),
  quantity: Number(item.quantity || 0),
  image: item.image || "",
});

const saveCart = async (userId, items) => {
  if (!isCassandraAvailable()) {
    return {
      items: (items || []).map(toCartItemMap).map(parseCartItemMap),
      updated_at: new Date(),
    };
  }

  try {
    const cartItems = (items || []).map(toCartItemMap);

    await client.execute(
      `INSERT INTO carts (user_id, items, updated_at)
       VALUES (?, ?, ?)
       USING TTL ${CART_TTL_SECONDS}`,
      [String(userId), cartItems, new Date()],
      { prepare: true }
    );

    return { items: cartItems.map(parseCartItemMap), updated_at: new Date() };
  } catch (error) {
    throw error;
  }
};

const getCart = async (userId) => {
  if (!isCassandraAvailable()) {
    return { items: [], updated_at: null };
  }

  try {
    const result = await client.execute(
      "SELECT items, updated_at FROM carts WHERE user_id = ?",
      [String(userId)],
      { prepare: true }
    );

    if (result.rowLength === 0) {
      return { items: [], updated_at: null };
    }

    const row = result.first();
    return {
      items: (row.items || []).map(parseCartItemMap),
      updated_at: row.updated_at,
    };
  } catch (error) {
    throw error;
  }
};

const clearCart = async (userId) => {
  if (!isCassandraAvailable()) {
    return { items: [], updated_at: null };
  }

  try {
    await client.execute(
      "DELETE FROM carts WHERE user_id = ?",
      [String(userId)],
      { prepare: true }
    );

    return { items: [], updated_at: null };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveCart,
  getCart,
  clearCart,
};

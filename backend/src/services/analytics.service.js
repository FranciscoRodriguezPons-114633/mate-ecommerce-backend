const { client } = require("../config/cassandra");

const counterToNumber = (value) => {
  if (!value) return 0;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
};

const incrementProductView = async (productId) => {
  try {
    await client.execute(
      "UPDATE product_views SET views = views + 1 WHERE product_id = ?",
      [String(productId)],
      { prepare: true }
    );
  } catch (error) {
    console.error("Error incrementando vista de producto en Cassandra:", error.message);
    throw error;
  }
};

const getProductViews = async (productId) => {
  try {
    const result = await client.execute(
      "SELECT views FROM product_views WHERE product_id = ?",
      [String(productId)],
      { prepare: true }
    );

    return result.rowLength ? counterToNumber(result.first().views) : 0;
  } catch (error) {
    console.error("Error obteniendo vistas de producto en Cassandra:", error.message);
    throw error;
  }
};

const getTopViewedProducts = async (limit = 10) => {
  try {
    const result = await client.execute(
      "SELECT product_id, views FROM product_views LIMIT ?",
      [50],
      { prepare: true }
    );

    return result.rows
      .map((row) => ({
        product_id: row.product_id,
        views: counterToNumber(row.views),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, Number(limit) || 10);
  } catch (error) {
    console.error("Error obteniendo productos mas vistos en Cassandra:", error.message);
    throw error;
  }
};

module.exports = {
  incrementProductView,
  getProductViews,
  getTopViewedProducts,
};

const cassandra = require("cassandra-driver");
const { client } = require("../config/cassandra");

const counterToNumber = (value) => {
  if (!value) return 0;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
};

const incrementProductSales = async (productId, quantity = 1) => {
  try {
    await client.execute(
      "UPDATE product_sales SET sales = sales + ? WHERE product_id = ?",
      [cassandra.types.Long.fromNumber(Number(quantity) || 1), String(productId)],
      { prepare: true }
    );
  } catch (error) {
    console.error("Error incrementando ventas de producto en Cassandra:", error.message);
    throw error;
  }
};

const getProductSales = async (productId) => {
  try {
    const result = await client.execute(
      "SELECT sales FROM product_sales WHERE product_id = ?",
      [String(productId)],
      { prepare: true }
    );

    return result.rowLength ? counterToNumber(result.first().sales) : 0;
  } catch (error) {
    console.error("Error obteniendo ventas de producto en Cassandra:", error.message);
    throw error;
  }
};

const getTopSoldProducts = async (limit = 10) => {
  try {
    const result = await client.execute(
      "SELECT product_id, sales FROM product_sales LIMIT ?",
      [50],
      { prepare: true }
    );

    return result.rows
      .map((row) => ({
        product_id: row.product_id,
        sales: counterToNumber(row.sales),
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, Number(limit) || 10);
  } catch (error) {
    console.error("Error obteniendo productos mas vendidos en Cassandra:", error.message);
    throw error;
  }
};

module.exports = {
  incrementProductSales,
  getProductSales,
  getTopSoldProducts,
};

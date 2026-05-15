const {
  saveCart: saveCartService,
  getCart: getCartService,
  clearCart: clearCartService,
} = require("../services/cart.service");

const getCart = async (req, res, next) => {
  try {
    const cart = await getCartService(req.user.id);
    return res.status(200).json(cart);
  } catch (error) {
    console.error("No se pudo obtener el carrito desde Cassandra:", error.message);
    return res.status(200).json({ items: [], updated_at: null });
  }
};

const saveCart = async (req, res, next) => {
  try {
    const cart = await saveCartService(req.user.id, req.body.items || []);
    return res.status(200).json(cart);
  } catch (error) {
    console.error("No se pudo guardar el carrito en Cassandra:", error.message);
    return res
      .status(200)
      .json({ items: req.body.items || [], updated_at: new Date() });
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await clearCartService(req.user.id);
    return res.status(200).json(cart);
  } catch (error) {
    console.error("No se pudo limpiar el carrito en Cassandra:", error.message);
    return res.status(200).json({ items: [], updated_at: null });
  }
};

module.exports = {
  getCart,
  saveCart,
  clearCart,
};

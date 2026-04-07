const {
  createOrderService,
  getMyOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
} = require("../services/order.service");

const createOrder = async (req, res, next) => {
  try {
    const order = await createOrderService(req.user.id, req.body.items);
    return res.status(201).json(order);
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await getMyOrdersService(req.user.id);
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await getAllOrdersService();
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await updateOrderStatusService(req.params.id, req.body.status);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
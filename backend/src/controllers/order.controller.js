const {
  createOrderService,
  getMyOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
} = require("../services/order.service");
const Order = require("../models/Order");
const {
  createOrderInCassandra,
  getOrdersByUser,
  getOrdersByStatus,
  getAllStatuses,
  updateOrderStatusInCassandra,
} = require("../services/order.cassandra.service");
const { incrementProductSales } = require("../services/sales.analytics.service");
const { redisClient } = require("../config/redis");

const createOrder = async (req, res, next) => {
  try {
    const order = await createOrderService(req.user.id, req.body.items);

    try {
      await createOrderInCassandra(
        req.user.id,
        order.items,
        order.total,
        order.items,
        req.user.name,
        req.user.email,
        order.createdAt,
        order._id.toString()
      );
    } catch (cassandraError) {
      console.error(
        "No se pudo registrar el pedido en Cassandra:",
        cassandraError.message
      );
    }

    try {
      await Promise.all(
        order.items.map((item) =>
          incrementProductSales(item.product.toString(), item.quantity)
        )
      );

      if (redisClient.isOpen) {
        const cacheKeys = await redisClient.keys("analytics:top-sold-products:*");
        if (cacheKeys.length) {
          await redisClient.del(cacheKeys);
        }
      }
    } catch (salesError) {
      console.error(
        "No se pudieron actualizar las ventas en Cassandra:",
        salesError.message
      );
    }

    return res.status(201).json(order);
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    let orders = [];

    try {
      orders = await getOrdersByUser(req.user.id);
    } catch (cassandraError) {
      console.error(
        "No se pudieron obtener pedidos desde Cassandra:",
        cassandraError.message
      );
    }

    if (!orders.length) {
      orders = await getMyOrdersService(req.user.id);
    }

    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    let orders = [];

    try {
      orders = req.query.status
        ? await getOrdersByStatus(req.query.status)
        : await getAllStatuses();
    } catch (cassandraError) {
      console.error(
        "No se pudieron obtener pedidos admin desde Cassandra:",
        cassandraError.message
      );
    }

    if (!orders.length) {
      orders = await getAllOrdersService();
    }

    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const previousOrder = await Order.findById(req.params.id).lean();
    const order = await updateOrderStatusService(req.params.id, req.body.status);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (previousOrder) {
      try {
        await updateOrderStatusInCassandra(
          req.params.id,
          previousOrder.status,
          req.body.status,
          previousOrder.createdAt
        );
      } catch (cassandraError) {
        console.error(
          "No se pudo actualizar el estado en Cassandra:",
          cassandraError.message
        );
      }
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

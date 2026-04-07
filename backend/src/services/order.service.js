const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrderService = async (userId, items) => {
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Producto no encontrado: ${item.product}`);
    }

    if (product.quantity < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}`);
    }

    const subtotal = product.price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });

    total += subtotal;
  }

  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity },
    });
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    total,
    status: "pending",
  });

  return order;
};

const getMyOrdersService = async (userId) => {
  return await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .lean();
};

const getAllOrdersService = async () => {
  return await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email role")
    .lean();
};

const updateOrderStatusService = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true }
  ).populate("user", "name email role");

  return order;
};

module.exports = {
  createOrderService,
  getMyOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
};
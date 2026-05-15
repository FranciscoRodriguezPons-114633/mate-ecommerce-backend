const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");
const {
  getCart,
  saveCart,
  clearCart,
} = require("../controllers/cart.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");
const validateObjectId = require("../middlewares/validateObjectId");
const {
  validateCreateOrderSchema,
  validateUpdateOrderStatusSchema,
} = require("../middlewares/validateOrderSchema");

router.post("/", authMiddleware, validateCreateOrderSchema, createOrder);
router.get("/mine", authMiddleware, getMyOrders);
router.get("/cart", authMiddleware, getCart);
router.post("/cart", authMiddleware, saveCart);
router.delete("/cart", authMiddleware, clearCart);
router.get("/", authMiddleware, requireAdmin, getAllOrders);
router.put(
  "/:id/status",
  authMiddleware,
  requireAdmin,
  validateObjectId,
  validateUpdateOrderStatusSchema,
  updateOrderStatus
);

module.exports = router;

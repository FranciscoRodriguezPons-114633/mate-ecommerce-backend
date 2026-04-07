const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

const authMiddleware = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");
const validateObjectId = require("../middlewares/validateObjectId");
const {
  validateCreateOrderSchema,
  validateUpdateOrderStatusSchema,
} = require("../middlewares/validateOrderSchema");

router.post("/", authMiddleware, validateCreateOrderSchema, createOrder);
router.get("/mine", authMiddleware, getMyOrders);
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
const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const {
  trackProductView,
  getTopProducts,
  getTopSoldProductsController,
} = require("../controllers/analytics.controller");

const validateObjectId = require("../middlewares/validateObjectId");
const {
  validateProductSchema,
  validateProductUpdateSchema,
} = require("../middlewares/validateProductSchema");

const authMiddleware = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");

router.get("/", getProducts);
router.get("/analytics/top", getTopProducts);
router.get("/analytics/top-sold", getTopSoldProductsController);
router.get("/:id", validateObjectId, getProductById);
router.post("/:id/view", trackProductView);

router.post(
  "/",
  authMiddleware,
  requireAdmin,
  validateProductSchema,
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  validateObjectId,
  validateProductUpdateSchema,
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  validateObjectId,
  deleteProduct
);

module.exports = router;

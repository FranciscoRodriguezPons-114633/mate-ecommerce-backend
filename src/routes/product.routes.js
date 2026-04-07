const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const validateObjectId = require('../middlewares/validateObjectId');
const { validateProductSchema, validateProductUpdateSchema } = require('../middlewares/validateProductSchema');

router.get("/", getProducts);
router.get("/:id", validateObjectId, getProductById);
router.post("/", validateProductSchema, createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", validateObjectId, deleteProduct);

module.exports = router;
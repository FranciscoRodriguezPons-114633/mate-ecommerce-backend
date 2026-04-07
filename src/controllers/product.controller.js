const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
} = require("../services/product.service");

// GET /products
const getProducts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ error: "Parámetros de paginación inválidos" });
  }

  try {
    const result = await getAllProducts(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// GET /products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// POST /products
const createProduct = async (req, res, next) => {
  try {
    const newProduct = await addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.message.includes("ya existe")) {
      error.status = 409;
    }
    next(error);
  }
};

// PUT /products/:id
const updateProduct = async (req, res, next) => {
  try {
    const updated = await updateProductService(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await deleteProductService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
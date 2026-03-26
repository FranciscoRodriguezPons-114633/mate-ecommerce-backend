const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
} = require("../services/product.service");

// GET /products
const getProducts = async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
};

// GET /products/:id
const getProductById = async (req, res) => {
  const product = await getProduct(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
};

// POST /products
const createProduct = async (req, res) => {
  const newProduct = await addProduct(req.body);
  res.status(201).json(newProduct);
};

// PUT /products/:id
const updateProduct = async (req, res) => {
  const updated = await updateProductService(req.params.id, req.body);

  if (!updated) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(updated);
};

// DELETE /products/:id
const deleteProduct = async (req, res) => {
  const deleted = await deleteProductService(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json({ message: "Producto eliminado" });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
} = require("../services/product.service");

const { validateProductId, validateProductBody } = require("../utils/productValidators");

// GET /products
const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// GET /products/:id
const getProductById = async (req, res) => {
  const validationError = validateProductId(req.params.id);
  if (validationError) {
    return res.status(validationError.status).json({ error: validationError.error });
  }

  try {
    const product = await getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST /products
const createProduct = async (req, res) => {
  const validationError = validateProductBody(req.body);
  if (validationError) {
    return res.status(validationError.status).json({ error: validationError.error });
  }

  try {
    const newProduct = await addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
    if (error.message.includes("ya existe")) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT /products/:id
const updateProduct = async (req, res) => {
  const idValidationError = validateProductId(req.params.id);
  if (idValidationError) {
    return res.status(idValidationError.status).json({ error: idValidationError.error });
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
  }

  const bodyValidationError = validateProductBody(req.body);
  if (bodyValidationError) {
    return res.status(bodyValidationError.status).json({ error: bodyValidationError.error });
  }

  try {
    const updated = await updateProductService(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// DELETE /products/:id
const deleteProduct = async (req, res) => {
  const validationError = validateProductId(req.params.id);
  if (validationError) {
    return res.status(validationError.status).json({ error: validationError.error });
  }

  try {
    const deleted = await deleteProductService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
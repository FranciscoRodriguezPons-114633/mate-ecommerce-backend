const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
} = require("../services/product.service");

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
const mongoose = require('mongoose'); // Asegúrate de importar si no está

const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }
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
  try {
    const { name, price, quantity, description } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Nombre y precio son obligatorios" });
    }
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ error: "La cantidad no puede ser negativa" });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ error: "La descripción no puede exceder 500 caracteres" });
    }
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
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
    }
    const { quantity, description } = req.body;
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ error: "La cantidad no puede ser negativa" });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ error: "La descripción no puede exceder 500 caracteres" });
    }
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
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }
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
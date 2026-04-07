const Product = require("../models/Product");

const getAllProducts = async () => {
  try {
    return await Product.find().lean().sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
};

const getProduct = async (id) => {
  try {
    return await Product.findById(id).lean(); // Agrega .populate('category') si aplica
  } catch (error) {
    throw new Error(`Error al obtener producto: ${error.message}`);
  }
};

const addProduct = async (data) => {
  try {
    // Validación básica
    if (!data.name || !data.price) {
      throw new Error("Nombre y precio son obligatorios");
    }
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error("La cantidad no puede ser negativa");
    }
    if (data.description && data.description.length > 500) {
      throw new Error("La descripción no puede exceder 500 caracteres");
    }
    const product = new Product(data);
    return await product.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Producto con ese nombre ya existe");
    }
    throw new Error(`Error al crear producto: ${error.message}`);
  }
};

const updateProductService = async (id, data) => {
  try {
    // Validación básica
    if (Object.keys(data).length === 0) {
      throw new Error("Debe proporcionar datos para actualizar");
    }
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error("La cantidad no puede ser negativa");
    }
    if (data.description && data.description.length > 500) {
      throw new Error("La descripción no puede exceder 500 caracteres");
    }
    const existing = await Product.findById(id);
    if (!existing) {
      return null; // O lanza error
    }
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  } catch (error) {
    throw new Error(`Error al actualizar producto: ${error.message}`);
  }
};

const deleteProductService = async (id) => {
  try {
    const result = await Product.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
};
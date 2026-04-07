const Product = require("../models/Product");

const getAllProducts = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const products = await Product.find().lean().sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Product.countDocuments();
  const totalPages = Math.ceil(total / limit);
  return {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalProducts: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

const getProduct = async (id) => {
  try {
    return await Product.findById(id).lean(); // Agrega .populate('category') si aplica
  } catch (error) {
    throw new Error(`Error al obtener producto con ID '${id}': ${error.message}`);
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
      throw new Error(`Producto con nombre '${data.name}' ya existe`);
    }
    throw new Error(`Error al crear producto con nombre '${data.name}': ${error.message}`);
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
    throw new Error(`Error al actualizar producto con ID '${id}': ${error.message}`);
  }
};

const deleteProductService = async (id) => {
  try {
    const result = await Product.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    throw new Error(`Error al eliminar producto con ID '${id}': ${error.message}`);
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
};
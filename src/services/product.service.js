const Product = require("../models/Product");

const getAllProducts = async () => {
  return await Product.find();
};

const getProduct = async (id) => {
  return await Product.findById(id);
};

const addProduct = async (data) => {
  const product = new Product(data);
  return await product.save();
};

const updateProductService = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

const deleteProductService = async (id) => {
  const result = await Product.findByIdAndDelete(id);
  return result !== null;
};

module.exports = {
  getAllProducts,
  getProduct,
  addProduct,
  updateProductService,
  deleteProductService,
};
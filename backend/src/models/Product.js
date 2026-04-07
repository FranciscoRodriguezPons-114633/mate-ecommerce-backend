const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Elimina espacios extra
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Precio no negativo
  },
  description: {
    type: String,
    required: false, // Opcional inicialmente
    maxlength: 500, // Límite razonable
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0, // No stock negativo
  },
  category: {
    type: String,
    required: false,
    trim: true,
  },
  image: {
    type: String,
    required: false, // URL opcional
  },
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model("Product", productSchema);
// utils/productValidators.js
const mongoose = require('mongoose');

const validateProductId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
    ? null
    : { error: "ID de producto inválido", status: 400 };
};

const validateProductBody = (body) => {
  const { name, price, quantity, description } = body;
  if (!name || !price) {
    return { error: "Nombre y precio son obligatorios", status: 400 };
  }
  if (quantity !== undefined && quantity < 0) {
    return { error: "La cantidad no puede ser negativa", status: 400 };
  }
  if (description && description.length > 500) {
    return { error: "La descripción no puede exceder 500 caracteres", status: 400 };
  }
  if (price < 0) {
    return { error: "El precio no puede ser negativo", status: 400 };
  }
  return null;
};

module.exports = { validateProductId, validateProductBody };
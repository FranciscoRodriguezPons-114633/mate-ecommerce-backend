const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(0),
  description: Joi.string().max(500),
  category: Joi.string(),
  image: Joi.string(),
});

const productUpdateSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number().min(0),
  quantity: Joi.number().min(0),
  description: Joi.string().max(500),
  category: Joi.string(),
  image: Joi.string(),
}).min(1);

const validateProductSchema = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateProductUpdateSchema = (req, res, next) => {
  const { error } = productUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateProductSchema, validateProductUpdateSchema };
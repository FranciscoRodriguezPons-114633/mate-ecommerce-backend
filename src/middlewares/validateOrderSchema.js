const Joi = require("joi");

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "paid", "shipped", "delivered", "cancelled")
    .required(),
});

const validateCreateOrderSchema = (req, res, next) => {
  const { error } = createOrderSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateUpdateOrderStatusSchema = (req, res, next) => {
  const { error } = updateOrderStatusSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = {
  validateCreateOrderSchema,
  validateUpdateOrderStatusSchema,
};
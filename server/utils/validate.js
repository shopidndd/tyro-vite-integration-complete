import Joi from 'joi'

export const schemas = {
  createIntent: Joi.object({
    amount: Joi.number().integer().min(50).required(),
    currency: Joi.string().valid('AUD').required(),
    card: Joi.object({
      pan: Joi.string().creditCard().required(),
      expMonth: Joi.string().pattern(/^\d{2}$/).required(),
      expYear: Joi.string().pattern(/^\d{4}$/).required(),
      cvv: Joi.string().pattern(/^\d{3,4}$/).required()
    }).required()
  }),
  capture: Joi.object({ amount: Joi.number().integer().min(50).required() }),
  refund: Joi.object({ amount: Joi.number().integer().min(1).required() })
}

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { stripUnknown: true })
    if (error) return res.status(400).json({ error: error.message })
    req.body = value
    next()
  }
}

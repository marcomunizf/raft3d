const { settingsService } = require('../services/settings.service');
const { Joi, validate } = require('../utils/validation');

const updateSchema = Joi.object({
  company_name: Joi.string().allow('', null).optional(),
  whatsapp_link: Joi.string().uri().allow('', null).optional(),
  default_sale_status: Joi.string()
    .valid('BUDGET', 'APPROVED', 'IN_PRODUCTION', 'DONE', 'DELIVERED', 'CANCELLED')
    .optional(),
  payment_methods: Joi.array().items(Joi.string().valid('PIX', 'CARD', 'CASH', 'TRANSFER', 'BOLETO')).optional(),
});

async function get(req, res, next) {
  try {
    const result = await settingsService.get();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const payload = validate(updateSchema, req.body);
    const result = await settingsService.update(payload);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { settingsController: { get, update } };

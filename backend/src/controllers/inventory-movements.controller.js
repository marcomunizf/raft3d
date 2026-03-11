const { inventoryMovementsService } = require('../services/inventory-movements.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const listSchema = Joi.object({
  item_id: Joi.string().guid({ version: ['uuidv4'] }).optional(),
  type: Joi.string().valid('IN', 'OUT', 'ADJUST', 'LOSS').optional(),
  start_date: Joi.string().isoDate().optional(),
  end_date: Joi.string().isoDate().optional(),
});

const createSchema = Joi.object({
  item_id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  type: Joi.string().valid('IN', 'OUT', 'ADJUST', 'LOSS').required(),
  qty: Joi.number().positive().required(),
  movement_date: Joi.string().isoDate().required(),
  reason: Joi.string().required(),
  sale_id: Joi.string().guid({ version: ['uuidv4'] }).allow(null, ''),
});

async function list(req, res, next) {
  try {
    const filters = validate(listSchema, req.query);
    const result = await inventoryMovementsService.list(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.sub;
    const payload = validate(createSchema, req.body);
    const result = await inventoryMovementsService.create(payload, userId);
    await audit({
      userId,
      entity: 'inventory_movements',
      entityId: result.movement.id,
      action: 'CREATE',
      data: { type: result.movement.type, qty: result.movement.qty, item_id: result.movement.item_id },
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  inventoryMovementsController: { list, create },
};

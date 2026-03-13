const { inventoryItemsService } = require('../services/inventory-items.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const idSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

const listSchema = Joi.object({
  category: Joi.string().valid('RAW_MATERIAL', 'CONSUMABLE').optional(),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  is_active: Joi.boolean().truthy('true').falsy('false').optional(),
});

const createSchema = Joi.object({
  name: Joi.string().required(),
  brand: Joi.string().optional().allow('', null),
  category: Joi.string().valid('RAW_MATERIAL', 'CONSUMABLE').required(),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  unit: Joi.string().required(),
  min_qty: Joi.number().min(0).required(),
  current_qty: Joi.number().min(0).required(),
  is_active: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  brand: Joi.string().optional().allow('', null),
  category: Joi.string().valid('RAW_MATERIAL', 'CONSUMABLE').optional(),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  unit: Joi.string().optional(),
  min_qty: Joi.number().min(0).optional(),
  current_qty: Joi.number().min(0).optional(),
  is_active: Joi.boolean().optional(),
});

function ensureInventoryTypePermission(req, itemType) {
  const role = req.user?.role;
  if (role === 'ADMIN') return;

  const permissions = req.user?.permissions || [];
  if (permissions.includes('producao')) return;
  if (itemType === 'RESINA' && permissions.includes('producao-resina')) return;
  if (itemType === 'FDM' && permissions.includes('producao-fdm')) return;

  const error = new Error('Forbidden: insufficient inventory type permission');
  error.statusCode = 403;
  error.code = 'FORBIDDEN';
  throw error;
}

async function list(req, res, next) {
  try {
    const filters = validate(listSchema, req.query);
    const result = await inventoryItemsService.list(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = validate(idSchema, req.params);
    const result = await inventoryItemsService.getById(id);
    if (!result) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.sub;
    const payload = validate(createSchema, req.body);
    ensureInventoryTypePermission(req, payload.type || 'RESINA');
    const result = await inventoryItemsService.create(payload);
    await audit({ userId, entity: 'inventory_items', entityId: result.id, action: 'CREATE', data: { name: result.name, category: result.category, type: result.type } });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const payload = validate(updateSchema, req.body);
    const currentItem = await inventoryItemsService.getById(id);
    if (!currentItem) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    ensureInventoryTypePermission(req, payload.type || currentItem.type || 'RESINA');
    const result = await inventoryItemsService.update(id, payload);
    await audit({ userId, entity: 'inventory_items', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const result = await inventoryItemsService.deactivate(id);
    await audit({ userId, entity: 'inventory_items', entityId: id, action: 'DELETE' });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getLog(req, res, next) {
  try {
    const { id } = validate(idSchema, req.params);
    const result = await inventoryItemsService.getLog(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  inventoryItemsController: { list, getById, create, update, deactivate, getLog },
};

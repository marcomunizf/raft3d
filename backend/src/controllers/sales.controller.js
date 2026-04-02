const { salesService } = require('../services/sales.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const saleStatus = ['BUDGET', 'APPROVED', 'IN_PRODUCTION', 'DONE', 'DELIVERED', 'CANCELLED'];
const paymentStatus = ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'];
const paymentMethods = ['PIX', 'CARD', 'CASH', 'TRANSFER', 'BOLETO'];

const idSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

const listSchema = Joi.object({
  start_date: Joi.string().isoDate().optional(),
  end_date: Joi.string().isoDate().optional(),
  status: Joi.string().valid(...saleStatus).optional(),
  payment_status: Joi.string().valid(...paymentStatus).optional(),
  customer_id: Joi.string().guid({ version: ['uuidv4'] }).optional(),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
});

const saleItemSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).optional(),
  description: Joi.string().required(),
  qty: Joi.number().positive().required(),
  unit_price: Joi.number().min(0).required(),
  line_total: Joi.number().min(0).required(),
  item_type: Joi.string().allow('', null),
  item_color: Joi.string().allow('', null),
  weight_grams: Joi.number().min(0).allow(null),
  print_time_hours: Joi.number().min(0).allow(null),
  is_done: Joi.boolean().optional(),
});

const createSchema = Joi.object({
  customer_id: Joi.string().guid({ version: ['uuidv4'] }).allow(null, ''),
  customer_name_snapshot: Joi.string().allow('', null),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  material_type: Joi.string().allow('', null),
  material_color: Joi.string().allow('', null),
  weight_grams: Joi.number().min(0).allow(null),
  print_time_hours: Joi.number().min(0).allow(null),
  status: Joi.string().valid(...saleStatus).required(),
  sale_date: Joi.string().isoDate().required(),
  due_date: Joi.string().isoDate().allow(null, ''),
  subtotal: Joi.number().min(0).required(),
  discount_total: Joi.number().min(0).default(0),
  total: Joi.number().min(0).required(),
  payment_status: Joi.string().valid(...paymentStatus).required(),
  payment_method: Joi.string().valid(...paymentMethods).allow('', null),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(saleItemSchema).default([]),
});

const updateSchema = Joi.object({
  customer_id: Joi.string().guid({ version: ['uuidv4'] }).allow(null, ''),
  customer_name_snapshot: Joi.string().allow('', null),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  material_type: Joi.string().allow('', null),
  material_color: Joi.string().allow('', null),
  weight_grams: Joi.number().min(0).allow(null),
  print_time_hours: Joi.number().min(0).allow(null),
  status: Joi.string().valid(...saleStatus).optional(),
  sale_date: Joi.string().isoDate().optional(),
  due_date: Joi.string().isoDate().allow(null, ''),
  subtotal: Joi.number().min(0).optional(),
  discount_total: Joi.number().min(0).optional(),
  total: Joi.number().min(0).optional(),
  payment_status: Joi.string().valid(...paymentStatus).optional(),
  payment_method: Joi.string().valid(...paymentMethods).allow('', null),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(saleItemSchema).optional(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid(...saleStatus).optional(),
  payment_status: Joi.string().valid(...paymentStatus).optional(),
  payment_method: Joi.string().valid(...paymentMethods).allow('', null),
  customer_notified: Joi.boolean().optional(),
}).or('status', 'payment_status', 'payment_method', 'customer_notified');

const paymentSchema = Joi.object({
  method: Joi.string().valid('PIX', 'CARD', 'CASH', 'TRANSFER', 'BOLETO').required(),
  amount: Joi.number().min(0.01).required(),
  paid_at: Joi.string().isoDate().required(),
  notes: Joi.string().allow('', null),
});

const itemStatusSchema = Joi.object({
  is_done: Joi.boolean().required(),
});

const cancelSchema = Joi.object({
  senha: Joi.string().trim().required(),
});

function ensureSalesTypePermission(req, saleType) {
  const role = req.user?.role;
  if (role === 'ADMIN') return;

  const permissions = req.user?.permissions || [];
  if (permissions.includes('producao')) return;
  if (saleType === 'RESINA' && permissions.includes('producao-resina')) return;
  if (saleType === 'FDM' && permissions.includes('producao-fdm')) return;

  const error = new Error('Forbidden: insufficient permissions');
  error.statusCode = 403;
  error.code = 'FORBIDDEN';
  throw error;
}

function ensureSaleMutable(sale) {
  if (!sale) return;
  if (sale.status === 'DELIVERED' && sale.payment_status === 'PAID') {
    const error = new Error('Pedido entregue e pago nao pode mais ser alterado.');
    error.statusCode = 409;
    error.code = 'SALE_LOCKED';
    throw error;
  }
}

function applyItemTotals(payload) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return payload;
  }

  const subtotal = payload.items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  const discount = Number(payload.discount_total || 0);

  return {
    ...payload,
    subtotal,
    total: Math.max(0, subtotal - discount),
  };
}

async function list(req, res, next) {
  try {
    const filters = validate(listSchema, req.query);
    const result = await salesService.list(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.sub;
    const payload = applyItemTotals(validate(createSchema, req.body));
    ensureSalesTypePermission(req, payload.type || 'RESINA');
    const result = await salesService.create(payload, userId);
    await audit({
      userId,
      entity: 'sales',
      entityId: result.id,
      action: 'CREATE',
      data: { total: result.total, status: result.status || payload.status || 'BUDGET' },
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = validate(idSchema, req.params);
    const result = await salesService.getById(id);
    if (!result) {
      const error = new Error('Sale not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const payload = applyItemTotals(validate(updateSchema, req.body));
    const currentSale = await salesService.getById(id);
    if (!currentSale) {
      const error = new Error('Sale not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    ensureSaleMutable(currentSale);
    ensureSalesTypePermission(req, payload.type || currentSale.type || 'RESINA');
    const result = await salesService.update(id, payload);
    await audit({ userId, entity: 'sales', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const currentSale = await salesService.getById(id);
    if (!currentSale) {
      const error = new Error('Sale not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    ensureSaleMutable(currentSale);
    const payload = validate(statusSchema, req.body);
    const result = await salesService.updateStatus(id, payload);
    await audit({ userId, entity: 'sales', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const { id } = validate(idSchema, req.params);
    const currentSale = await salesService.getById(id);
    if (!currentSale) {
      const error = new Error('Sale not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    ensureSaleMutable(currentSale);
    const payload = validate(cancelSchema, req.body);
    const result = await salesService.cancel(id, userId, role, permissions, payload.senha);
    await audit({ userId, entity: 'sales', entityId: id, action: 'CANCEL' });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function listPayments(req, res, next) {
  try {
    const { id } = validate(idSchema, req.params);
    const result = await salesService.listPayments(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function addPayment(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const currentSale = await salesService.getById(id);
    if (!currentSale) {
      const error = new Error('Sale not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    ensureSaleMutable(currentSale);
    const payload = validate(paymentSchema, req.body);
    const result = await salesService.addPayment(id, payload, userId);
    await audit({ userId, entity: 'payments', entityId: result.id, action: 'CREATE', data: { amount: result.amount, method: result.method } });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateItemStatus(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id, itemId } = validate(Joi.object({
      id: Joi.string().guid({ version: ['uuidv4'] }).required(),
      itemId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    }), req.params);
    const currentSale = await salesService.getById(id);
    if (!currentSale) {
      const error = new Error('Sale not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    ensureSaleMutable(currentSale);
    const payload = validate(itemStatusSchema, req.body);
    const result = await salesService.updateItemStatus(id, itemId, payload.is_done);
    await audit({ userId, entity: 'sale_items', entityId: itemId, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  salesController: {
    list,
    create,
    getById,
    update,
    updateStatus,
    cancel,
    listPayments,
    addPayment,
    updateItemStatus,
  },
};


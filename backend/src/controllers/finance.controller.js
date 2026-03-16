const { financeService } = require('../services/finance.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const entryTypes = ['INCOME', 'EXPENSE'];
const entryStatuses = ['PENDING', 'PAID', 'CANCELLED'];
const processTypes = ['GENERAL', 'RESINA', 'FDM', 'DRAWING'];

const idSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

const listSchema = Joi.object({
  start_date: Joi.string().isoDate().optional(),
  end_date: Joi.string().isoDate().optional(),
  entry_type: Joi.string().valid(...entryTypes).optional(),
  status: Joi.string().valid(...entryStatuses).optional(),
  process_type: Joi.string().valid(...processTypes).optional(),
  q: Joi.string().allow('', null).optional(),
});

const createSchema = Joi.object({
  entry_type: Joi.string().valid(...entryTypes).required(),
  category: Joi.string().trim().min(2).max(80).required(),
  description: Joi.string().trim().min(2).max(200).required(),
  amount: Joi.number().min(0).required(),
  entry_date: Joi.string().isoDate().required(),
  due_date: Joi.string().isoDate().allow('', null),
  paid_date: Joi.string().isoDate().allow('', null),
  status: Joi.string().valid(...entryStatuses).required(),
  process_type: Joi.string().valid(...processTypes).default('GENERAL'),
  payment_method: Joi.string().trim().allow('', null),
  customer_id: Joi.string().guid({ version: ['uuidv4'] }).allow('', null),
  customer_name_snapshot: Joi.string().trim().allow('', null),
  supplier_name_snapshot: Joi.string().trim().allow('', null),
  sale_id: Joi.string().guid({ version: ['uuidv4'] }).allow('', null),
  notes: Joi.string().allow('', null),
});

const updateSchema = Joi.object({
  entry_type: Joi.string().valid(...entryTypes).optional(),
  category: Joi.string().trim().min(2).max(80).optional(),
  description: Joi.string().trim().min(2).max(200).optional(),
  amount: Joi.number().min(0).optional(),
  entry_date: Joi.string().isoDate().optional(),
  due_date: Joi.string().isoDate().allow('', null).optional(),
  paid_date: Joi.string().isoDate().allow('', null).optional(),
  status: Joi.string().valid(...entryStatuses).optional(),
  process_type: Joi.string().valid(...processTypes).optional(),
  payment_method: Joi.string().trim().allow('', null).optional(),
  customer_id: Joi.string().guid({ version: ['uuidv4'] }).allow('', null).optional(),
  customer_name_snapshot: Joi.string().trim().allow('', null).optional(),
  supplier_name_snapshot: Joi.string().trim().allow('', null).optional(),
  sale_id: Joi.string().guid({ version: ['uuidv4'] }).allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
}).min(1);

const statusSchema = Joi.object({
  status: Joi.string().valid(...entryStatuses).required(),
  paid_date: Joi.string().isoDate().allow('', null).optional(),
});

async function getSummary(req, res, next) {
  try {
    const filters = validate(listSchema, req.query);
    const result = await financeService.getSummary(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function listEntries(req, res, next) {
  try {
    const filters = validate(listSchema, req.query);
    const result = await financeService.listEntries(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function createEntry(req, res, next) {
  try {
    const userId = req.user.sub;
    const payload = validate(createSchema, req.body);
    if (payload.entry_type === 'INCOME' && !payload.customer_id) {
      const error = new Error('Selecione um cliente para lancamentos de receita.');
      error.statusCode = 400;
      error.code = 'BUSINESS_RULE';
      throw error;
    }
    const result = await financeService.createEntry(payload, userId);
    await audit({ userId, entity: 'financial_entries', entityId: result.id, action: 'CREATE', data: payload });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateEntry(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const payload = validate(updateSchema, req.body);
    const result = await financeService.updateEntry(id, payload);
    await audit({ userId, entity: 'financial_entries', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateEntryStatus(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const payload = validate(statusSchema, req.body);
    const result = await financeService.updateEntryStatus(id, payload.status, payload.paid_date || null);
    await audit({ userId, entity: 'financial_entries', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  financeController: {
    getSummary,
    listEntries,
    createEntry,
    updateEntry,
    updateEntryStatus,
  },
};

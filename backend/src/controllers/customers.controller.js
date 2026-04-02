const { customersService } = require('../services/customers.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const idSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

const listSchema = Joi.object({
  q: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().truthy('true').falsy('false').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
});

const createSchema = Joi.object({
  type: Joi.string().valid('PF', 'PJ').optional(),
  name: Joi.string().required(),
  document: Joi.string().allow('', null),
  phone: Joi.string().allow('', null).optional(),
  email: Joi.string().email().allow('', null),
  notes: Joi.string().allow('', null),
  is_active: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  type: Joi.string().valid('PF', 'PJ').optional(),
  name: Joi.string().optional(),
  document: Joi.string().allow('', null),
  phone: Joi.string().optional(),
  email: Joi.string().email().allow('', null),
  notes: Joi.string().allow('', null),
  is_active: Joi.boolean().optional(),
});

async function list(req, res, next) {
  try {
    const filters = validate(listSchema, req.query);
    const result = await customersService.list(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = validate(idSchema, req.params);
    const result = await customersService.getById(id);
    if (!result) {
      const error = new Error('Customer not found');
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
    const result = await customersService.create(payload);
    await audit({ userId, entity: 'customers', entityId: result.id, action: 'CREATE', data: { name: result.name, type: result.type } });
    res.status(201).json(result);
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'customers_document_unique') {
      const friendly = new Error('CPF/CNPJ ja cadastrado para outro cliente.');
      friendly.statusCode = 409;
      friendly.code = 'CONFLICT';
      return next(friendly);
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const payload = validate(updateSchema, req.body);
    const result = await customersService.update(id, payload);
    await audit({ userId, entity: 'customers', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'customers_document_unique') {
      const friendly = new Error('CPF/CNPJ ja cadastrado para outro cliente.');
      friendly.statusCode = 409;
      friendly.code = 'CONFLICT';
      return next(friendly);
    }
    next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const result = await customersService.deactivate(id);
    await audit({ userId, entity: 'customers', entityId: id, action: 'DELETE' });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getSales(req, res, next) {
  try {
    const { id } = validate(idSchema, req.params);
    const result = await customersService.getSales(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  customersController: { list, getById, create, update, deactivate, getSales },
};

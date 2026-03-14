const { materialsService } = require('../services/materials.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const idSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

const listSchema = Joi.object({
  process: Joi.string().valid('RESINA', 'FDM').optional(),
  type: Joi.string().allow('', null).optional(),
  color: Joi.string().allow('', null).optional(),
  brand: Joi.string().allow('', null).optional(),
});

const createSchema = Joi.object({
  process: Joi.string().valid('RESINA', 'FDM').required(),
  type: Joi.string().trim().min(1).required(),
  color: Joi.string().trim().min(1).required(),
  brand: Joi.string().trim().min(1).required(),
});

const updateSchema = Joi.object({
  process: Joi.string().valid('RESINA', 'FDM').required(),
  type: Joi.string().trim().min(1).required(),
  color: Joi.string().trim().min(1).required(),
  brand: Joi.string().trim().min(1).required(),
});

async function list(req, res, next) {
  try {
    const filters = validate(listSchema, req.query);
    const result = await materialsService.list(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.sub;
    const payload = validate(createSchema, req.body);
    const result = await materialsService.create(payload);
    await audit({
      userId,
      entity: 'materials',
      entityId: result.id,
      action: 'CREATE',
      data: { process: result.process, type: result.type, color: result.color, brand: result.brand },
    });
    res.status(201).json(result);
  } catch (err) {
    if (err && err.code === '23505') {
      const error = new Error('Material ja cadastrado (comparacao sem diferenciar maiusculas/minusculas).');
      error.statusCode = 409;
      error.code = 'CONFLICT';
      return next(error);
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const payload = validate(updateSchema, req.body);

    const current = await materialsService.getById(id);
    if (!current || !current.is_active) {
      const error = new Error('Material not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    const result = await materialsService.update(id, payload);
    await audit({
      userId,
      entity: 'materials',
      entityId: id,
      action: 'UPDATE',
      data: payload,
    });

    res.status(200).json(result);
  } catch (err) {
    if (err && err.code === '23505') {
      const error = new Error('Material ja cadastrado (comparacao sem diferenciar maiusculas/minusculas).');
      error.statusCode = 409;
      error.code = 'CONFLICT';
      return next(error);
    }
    next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const result = await materialsService.deactivate(id);

    if (!result) {
      const error = new Error('Material not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    await audit({
      userId,
      entity: 'materials',
      entityId: id,
      action: 'DELETE',
      data: {},
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  materialsController: {
    list,
    create,
    update,
    deactivate,
  },
};

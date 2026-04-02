const { drawingsService } = require('../services/drawings.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const listSchema = Joi.object({
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  status: Joi.string().valid('ORCAMENTO', 'DESENHANDO', 'PRONTO', 'IMPRESSAO_TESTE', 'ENVIAR_PARA_PRODUCAO').optional(),
  designer_id: Joi.string().guid({ version: ['uuidv4'] }).optional(),
});

const idSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

const createSchema = Joi.object({
  title: Joi.string().trim().min(1).allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  customer_id: Joi.string().guid({ version: ['uuidv4'] }).allow(null).optional(),
  customer_name_snapshot: Joi.string().allow('', null).optional(),
  designer_id: Joi.string().guid({ version: ['uuidv4'] }).allow(null).optional(),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  status: Joi.string().valid('ORCAMENTO', 'DESENHANDO', 'PRONTO', 'IMPRESSAO_TESTE', 'ENVIAR_PARA_PRODUCAO').optional(),
  start_date: Joi.string().isoDate().optional(),
  end_date: Joi.string().isoDate().optional(),
  drawing_value: Joi.number().precision(2).min(0).allow(null).optional(),
  print_value: Joi.number().precision(2).min(0).allow(null).optional(),
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow('', null).optional(),
  customer_id: Joi.string().guid({ version: ['uuidv4'] }).allow(null).optional(),
  customer_name_snapshot: Joi.string().allow('', null).optional(),
  designer_id: Joi.string().guid({ version: ['uuidv4'] }).allow(null).optional(),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
  status: Joi.string().valid('ORCAMENTO', 'DESENHANDO', 'PRONTO', 'IMPRESSAO_TESTE', 'ENVIAR_PARA_PRODUCAO').optional(),
  start_date: Joi.string().isoDate().optional(),
  end_date: Joi.string().isoDate().optional(),
  drawing_value: Joi.number().precision(2).min(0).allow(null).optional(),
  print_value: Joi.number().precision(2).min(0).allow(null).optional(),
});

async function listDesigners(req, res, next) {
  try {
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const result = await drawingsService.listDesigners(role, permissions);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const filters = validate(listSchema, req.query);
    const result = await drawingsService.list(filters, role, permissions);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const { id } = validate(idSchema, req.params);
    const result = await drawingsService.getById(id, role, permissions);
    if (!result) {
      const error = new Error('Drawing not found');
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
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const payload = validate(createSchema, req.body);
    const result = await drawingsService.create(payload, userId, role, permissions);
    await audit({ userId, entity: 'drawings', entityId: result.id, action: 'CREATE', data: { type: result.type, designer_id: result.designer_id } });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const { id } = validate(idSchema, req.params);
    const payload = validate(updateSchema, req.body);
    const result = await drawingsService.update(id, payload, role, permissions);
    await audit({ userId, entity: 'drawings', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function sendToProduction(req, res, next) {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const { id } = validate(idSchema, req.params);
    const result = await drawingsService.sendToProduction(id, userId, role, permissions);
    await audit({ userId, entity: 'drawings', entityId: id, action: 'SEND_TO_PRODUCTION', data: {} });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    const permissions = req.user.permissions || [];
    const { id } = validate(idSchema, req.params);
    await drawingsService.remove(id, role, permissions);
    await audit({ userId, entity: 'drawings', entityId: id, action: 'DELETE', data: {} });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  drawingsController: {
    list,
    listDesigners,
    getById,
    create,
    update,
    sendToProduction,
    remove,
  },
};

const { usersService } = require('../services/users.service');
const { audit } = require('../utils/audit');
const { Joi, validate } = require('../utils/validation');

const roles = ['ADMIN', 'FUNCIONARIO'];

const idSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
});

const validPermissions = ['producao-resina', 'producao-fdm', 'producao'];

const createSchema = Joi.object({
  usuario: Joi.string().trim().min(1).optional(),
  name: Joi.string().trim().min(1).optional(),
  email: Joi.string().trim().min(1).optional(),
  senha: Joi.string().min(4).required(),
  role: Joi.string().valid(...roles).required(),
  permissions: Joi.array().items(Joi.string().valid(...validPermissions)).optional(),
}).or('usuario', 'name', 'email');

const updateSchema = Joi.object({
  usuario: Joi.string().trim().min(1).optional(),
  name: Joi.string().trim().min(1).optional(),
  email: Joi.string().trim().min(1).optional(),
  role: Joi.string().valid(...roles).optional(),
  permissions: Joi.array().items(Joi.string().valid(...validPermissions)).optional(),
});

const passwordSchema = Joi.object({
  senha_atual: Joi.string().required(),
  nova_senha: Joi.string().min(4).required(),
});

async function list(req, res, next) {
  try {
    const result = await usersService.list();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = validate(idSchema, req.params);
    const result = await usersService.getById(id);
    if (!result) {
      const error = new Error('User not found');
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
    const result = await usersService.create(payload);
    await audit({ userId, entity: 'users', entityId: result.id, action: 'CREATE', data: { role: result.role } });
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
    const result = await usersService.update(id, payload);
    await audit({ userId, entity: 'users', entityId: id, action: 'UPDATE', data: payload });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updatePassword(req, res, next) {
  try {
    const currentUserId = req.user.sub;
    const currentUserRole = req.user.role;
    const { id } = validate(idSchema, req.params);
    const payload = validate(passwordSchema, req.body);
    const result = await usersService.updatePassword(id, currentUserId, currentUserRole, payload);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const result = await usersService.deactivate(id);
    await audit({ userId, entity: 'users', entityId: id, action: 'DEACTIVATE' });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.sub;
    const { id } = validate(idSchema, req.params);
    const result = await usersService.remove(id);
    await audit({ userId, entity: 'users', entityId: id, action: 'DELETE' });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  usersController: { list, getById, create, update, updatePassword, deactivate, remove },
};

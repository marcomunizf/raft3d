const { dashboardService } = require('../services/dashboard.service');
const { Joi, validate } = require('../utils/validation');

const typeSchema = Joi.object({
  type: Joi.string().valid('RESINA', 'FDM').optional(),
});

const salesSeriesSchema = Joi.object({
  period: Joi.string().valid('day', 'week').optional(),
  start_date: Joi.string().isoDate().optional(),
  end_date: Joi.string().isoDate().optional(),
  type: Joi.string().valid('RESINA', 'FDM').optional(),
});

function getAllowedTypes(user) {
  if (user?.role === 'ADMIN') return ['RESINA', 'FDM'];
  const permissions = user?.permissions || [];
  if (permissions.includes('producao')) return ['RESINA', 'FDM'];
  const types = [];
  if (permissions.includes('producao-resina')) types.push('RESINA');
  if (permissions.includes('producao-fdm')) types.push('FDM');
  return types;
}

function resolveTypeFilter(req, queryType) {
  const allowed = getAllowedTypes(req.user);
  if (!allowed.length) {
    const error = new Error('Forbidden: insufficient permissions');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (!queryType) {
    return allowed.length === 1 ? allowed[0] : null;
  }

  if (!allowed.includes(queryType)) {
    const error = new Error('Forbidden: insufficient permissions');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  return queryType;
}

async function getSummary(req, res, next) {
  try {
    const filters = validate(typeSchema, req.query);
    const type = resolveTypeFilter(req, filters.type);
    const result = await dashboardService.getSummary({ type });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getSalesSeries(req, res, next) {
  try {
    const filters = validate(salesSeriesSchema, req.query);
    const type = resolveTypeFilter(req, filters.type);
    const result = await dashboardService.getSalesSeries({ ...filters, type });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getKanban(req, res, next) {
  try {
    const filters = validate(typeSchema, req.query);
    const type = resolveTypeFilter(req, filters.type);
    const result = await dashboardService.getKanban({ type });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboardController: { getSummary, getSalesSeries, getKanban } };

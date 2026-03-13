const { drawingsRepository } = require('../repositories/drawings.repository');
const { salesService } = require('./sales.service');
const { usersRepository } = require('../repositories/users.repository');
const { customersRepository } = require('../repositories/customers.repository');

function canManageDrawings(role, permissions = []) {
  if (role === 'ADMIN') return true;
  if (permissions.includes('producao')) return true;
  if (permissions.includes('projetista')) return true;
  return false;
}

async function ensureCanManage(role, permissions = []) {
  if (canManageDrawings(role, permissions)) return;
  const error = new Error('Forbidden: insufficient permissions');
  error.statusCode = 403;
  throw error;
}

async function ensureValidDesigner(designerId) {
  if (!designerId) return;
  const designer = await usersRepository.findById(designerId);
  const hasDesignerPermission = !!designer && (designer.permissions || []).includes('projetista');

  if (hasDesignerPermission) return;

  const error = new Error('Designer must have projetista permission');
  error.statusCode = 400;
  error.code = 'BUSINESS_RULE';
  throw error;
}

async function normalizeCustomerData(data = {}) {
  const next = { ...data };
  const customerId = next.customer_id || null;

  if (!customerId) {
    if (typeof next.customer_name_snapshot === 'string') {
      next.customer_name_snapshot = next.customer_name_snapshot.trim() || null;
    }
    return next;
  }

  const customer = await customersRepository.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 400;
    error.code = 'BUSINESS_RULE';
    throw error;
  }

  next.customer_id = customer.id;
  next.customer_name_snapshot = customer.name;
  return next;
}

async function list(filters, role, permissions = []) {
  await ensureCanManage(role, permissions);
  return drawingsRepository.list(filters || {});
}

async function getById(id, role, permissions = []) {
  await ensureCanManage(role, permissions);
  const drawing = await drawingsRepository.findById(id);
  return drawing || null;
}

async function create(data, userId, role, permissions = []) {
  if (!userId) {
    const error = new Error('Authenticated user required to create a drawing');
    error.statusCode = 401;
    throw error;
  }

  await ensureCanManage(role, permissions);
  const normalized = await normalizeCustomerData(data);
  await ensureValidDesigner(normalized.designer_id);

  return drawingsRepository.create({ ...normalized, created_by_user_id: userId });
}

async function update(id, data, role, permissions = []) {
  await ensureCanManage(role, permissions);
  const normalized = await normalizeCustomerData(data);

  if (Object.prototype.hasOwnProperty.call(normalized, 'designer_id')) {
    await ensureValidDesigner(normalized.designer_id);
  }

  return drawingsRepository.update(id, normalized || {});
}

async function sendToProduction(id, userId, role, permissions = []) {
  const drawing = await drawingsRepository.findById(id);
  if (!drawing) {
    const error = new Error('Drawing not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  await ensureCanManage(role, permissions);

  if (drawing.status !== 'PRONTO') {
    const error = new Error('Drawing must be PRONTO before sending to production');
    error.statusCode = 400;
    error.code = 'BUSINESS_RULE';
    throw error;
  }

  // Create a minimal sale as the production entry for this drawing
  const salePayload = {
    customer_id: drawing.customer_id || null,
    customer_name_snapshot: drawing.customer_name_snapshot || `Desenho: ${drawing.title || drawing.id}`,
    type: drawing.type || 'RESINA',
    status: 'BUDGET',
    sale_date: new Date().toISOString().slice(0, 10),
    due_date: null,
    subtotal: Number(drawing.print_value) || 0,
    discount_total: 0,
    total: Number(drawing.print_value) || 0,
    payment_status: 'PENDING',
    payment_method: null,
    notes: `Gerado a partir do desenho ${drawing.id}`,
    items: [],
  };

  const sale = await salesService.create(salePayload, userId);

  await drawingsRepository.update(id, { status: 'ENVIAR_PARA_PRODUCAO' });

  return { drawing: await drawingsRepository.findById(id), sale };
}

async function listDesigners(role, permissions = []) {
  await ensureCanManage(role, permissions);
  return drawingsRepository.listDesigners();
}

async function remove(id, role, permissions = []) {
  await ensureCanManage(role, permissions);
  const drawing = await drawingsRepository.findById(id);
  if (!drawing) {
    const error = new Error('Drawing not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return drawingsRepository.remove(id);
}

module.exports = {
  drawingsService: {
    list,
    getById,
    create,
    update,
    sendToProduction,
    listDesigners,
    remove,
  },
};

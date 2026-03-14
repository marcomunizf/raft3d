const { salesRepository } = require('../repositories/sales.repository');
const { authService } = require('./auth.service');

function ensureSaleIsMutable(sale) {
  if (!sale) return;
  if (sale.status === 'DELIVERED' && sale.payment_status === 'PAID') {
    const error = new Error('Pedido entregue e pago nao pode mais ser alterado.');
    error.statusCode = 400;
    error.code = 'BUSINESS_RULE';
    throw error;
  }
}

async function list(filters) {
  return salesRepository.list(filters || {});
}

async function create(data, userId) {
  if (!userId) {
    const error = new Error('Authenticated user required to create a sale');
    error.statusCode = 401;
    throw error;
  }

  return salesRepository.create({ ...data, created_by_user_id: userId });
}

async function getById(id) {
  const sale = await salesRepository.findById(id);
  return sale || null;
}

async function update(id, data) {
  const sale = await salesRepository.findById(id);
  if (!sale) {
    const error = new Error('Sale not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  ensureSaleIsMutable(sale);
  return salesRepository.update(id, data || {});
}

async function updateStatus(id, data) {
  const sale = await salesRepository.findById(id);
  if (!sale) {
    const error = new Error('Sale not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  ensureSaleIsMutable(sale);
  return salesRepository.updateStatus(id, data.status, data.payment_status, data.payment_method);
}

function canHandleSaleType(role, permissions, saleType) {
  if (role === 'ADMIN') return true;
  if ((permissions || []).includes('producao')) return true;
  if (saleType === 'RESINA' && (permissions || []).includes('producao-resina')) return true;
  if (saleType === 'FDM' && (permissions || []).includes('producao-fdm')) return true;
  return false;
}

async function cancel(id, userId, role, permissions, senha) {
  const sale = await salesRepository.findById(id);
  if (!sale) {
    const error = new Error('Sale not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  ensureSaleIsMutable(sale);

  if (!canHandleSaleType(role, permissions, sale.type || 'RESINA')) {
    const error = new Error('Forbidden: insufficient permissions');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (!['BUDGET', 'APPROVED'].includes(sale.status)) {
    const error = new Error('Apenas pedidos em Orcamento ou A Produzir podem ser excluidos.');
    error.statusCode = 400;
    error.code = 'BUSINESS_RULE';
    throw error;
  }

  await authService.confirmPassword(userId, senha);
  return salesRepository.cancel(id);
}

async function listPayments(id) {
  return salesRepository.listPayments(id);
}

async function addPayment(id, data, userId) {
  if (!userId) {
    const error = new Error('Authenticated user required to add a payment');
    error.statusCode = 401;
    throw error;
  }

  const sale = await salesRepository.findById(id);
  if (!sale) {
    const error = new Error('Sale not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  ensureSaleIsMutable(sale);

  return salesRepository.addPayment(id, { ...data, created_by_user_id: userId });
}

module.exports = {
  salesService: {
    list,
    create,
    getById,
    update,
    updateStatus,
    cancel,
    listPayments,
    addPayment,
  },
};

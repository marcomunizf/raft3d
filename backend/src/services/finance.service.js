const { financeRepository } = require('../repositories/finance.repository');

async function getSummary(filters) {
  return financeRepository.getSummary(filters || {});
}

async function listEntries(filters) {
  return financeRepository.listEntries(filters || {});
}

async function getEntryById(id) {
  return financeRepository.findEntryById(id);
}

async function createEntry(data, userId) {
  if (!userId) {
    const error = new Error('Authenticated user required');
    error.statusCode = 401;
    throw error;
  }

  return financeRepository.createEntry({ ...data, created_by_user_id: userId });
}

async function updateEntry(id, data) {
  const current = await financeRepository.findEntryById(id);
  if (!current) {
    const error = new Error('Financial entry not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const nextType = data.entry_type || current.entry_type;
  const nextCustomerId = typeof data.customer_id !== 'undefined' ? data.customer_id : current.customer_id;
  if (nextType === 'INCOME' && !nextCustomerId) {
    const error = new Error('Selecione um cliente para lancamentos de receita.');
    error.statusCode = 400;
    error.code = 'BUSINESS_RULE';
    throw error;
  }

  return financeRepository.updateEntry(id, data || {});
}

async function updateEntryStatus(id, status, paidDate) {
  const current = await financeRepository.findEntryById(id);
  if (!current) {
    const error = new Error('Financial entry not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return financeRepository.updateEntryStatus(id, status, paidDate);
}

module.exports = {
  financeService: {
    getSummary,
    listEntries,
    getEntryById,
    createEntry,
    updateEntry,
    updateEntryStatus,
  },
};

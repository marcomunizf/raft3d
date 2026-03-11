const { inventoryMovementsRepository } = require('../repositories/inventory-movements.repository');

async function list(filters) {
  return inventoryMovementsRepository.list(filters || {});
}

async function create(data, userId) {
  if (!userId) {
    const error = new Error('Authenticated user required to register a movement');
    error.statusCode = 401;
    throw error;
  }

  return inventoryMovementsRepository.create({ ...data, created_by_user_id: userId });
}

module.exports = { inventoryMovementsService: { list, create } };

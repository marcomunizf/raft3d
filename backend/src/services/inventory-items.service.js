const { inventoryItemsRepository } = require('../repositories/inventory-items.repository');

async function list(filters) {
  return inventoryItemsRepository.list(filters);
}

async function getById(id) {
  return inventoryItemsRepository.findById(id);
}

async function create(data) {
  return inventoryItemsRepository.create(data);
}

async function update(id, data) {
  return inventoryItemsRepository.update(id, data);
}

async function deactivate(id) {
  return inventoryItemsRepository.deactivate(id);
}

async function getLog(id) {
  return inventoryItemsRepository.getLog(id);
}

module.exports = {
  inventoryItemsService: { list, getById, create, update, deactivate, getLog },
};

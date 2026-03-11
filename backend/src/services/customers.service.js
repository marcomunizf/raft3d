const { customersRepository } = require('../repositories/customers.repository');

async function list(filters) {
  return customersRepository.list(filters);
}

async function getById(id) {
  return customersRepository.findById(id);
}

async function create(data) {
  return customersRepository.create(data);
}

async function update(id, data) {
  return customersRepository.update(id, data);
}

async function deactivate(id) {
  return customersRepository.deactivate(id);
}

async function getSales(id) {
  return customersRepository.listSales(id);
}

module.exports = { customersService: { list, getById, create, update, deactivate, getSales } };

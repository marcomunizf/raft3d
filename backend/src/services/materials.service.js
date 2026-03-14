const { materialsRepository } = require('../repositories/materials.repository');

async function list(filters) {
  return materialsRepository.list(filters || {});
}

async function getById(id) {
  return materialsRepository.findById(id);
}

async function create(data) {
  return materialsRepository.create(data);
}

async function update(id, data) {
  return materialsRepository.update(id, data);
}

async function deactivate(id) {
  const inUse = await materialsRepository.hasActiveInventoryUsage(id);
  if (inUse) {
    const error = new Error('Material em uso no estoque ativo. Desative os itens de estoque vinculados antes de excluir o material.');
    error.statusCode = 409;
    error.code = 'MATERIAL_IN_USE';
    throw error;
  }

  return materialsRepository.deactivate(id);
}

module.exports = {
  materialsService: {
    list,
    getById,
    create,
    update,
    deactivate,
  },
};

const { settingsRepository } = require('../repositories/settings.repository');

async function get() {
  return settingsRepository.get();
}

async function update(data) {
  return settingsRepository.update(data);
}

module.exports = { settingsService: { get, update } };

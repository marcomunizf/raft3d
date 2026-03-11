const { dashboardRepository } = require('../repositories/dashboard.repository');

async function getSummary(filters) {
  return dashboardRepository.getSummary(filters || {});
}

async function getSalesSeries(filters) {
  return dashboardRepository.getSalesSeries(filters || {});
}

async function getKanban(filters) {
  return dashboardRepository.getKanban(filters || {});
}

module.exports = { dashboardService: { getSummary, getSalesSeries, getKanban } };

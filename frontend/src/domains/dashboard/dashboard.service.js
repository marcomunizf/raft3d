import { api } from '../../services/api.js';

export async function fetchDashboardSummary(type) {
  const response = await api.get('/dashboard/summary', { params: { type } });
  return response.data;
}

export async function fetchSalesSeries(type, period = 'day') {
  const response = await api.get('/dashboard/sales-series', { params: { period, type } });
  return response.data;
}
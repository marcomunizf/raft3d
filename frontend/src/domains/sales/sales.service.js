import { api } from '../../services/api.js';

export async function fetchSales(params = {}) {
  const response = await api.get('/sales', { params });
  return response.data;
}

export async function fetchSaleDetails(saleId) {
  const response = await api.get(`/sales/${saleId}`);
  return response.data;
}

export async function createSale(payload) {
  await api.post('/sales', payload);
}

export async function updateSale(saleId, payload) {
  await api.put(`/sales/${saleId}`, payload);
}

export async function updateSaleStatus(saleId, payload) {
  await api.patch(`/sales/${saleId}/status`, payload);
}

export async function updateSaleItemStatus(saleId, itemId, payload) {
  const response = await api.patch(`/sales/${saleId}/items/${itemId}/status`, payload);
  return response.data;
}

export async function cancelSale(saleId, senha) {
  await api.post(`/sales/${saleId}/cancel`, { senha });
}

export async function fetchKanban(params = {}) {
  const response = await api.get('/dashboard/kanban', { params });
  return response.data;
}

import { api } from '../../services/api.js';

/**
 * Retorna array de vendas (retrocompat para usos simples).
 * Extrai apenas o array data da resposta paginada.
 */
export async function fetchSales(params = {}) {
  const response = await api.get('/sales', { params });
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
}

/**
 * Retorna resposta paginada completa { data, meta } para listagens com paginação.
 */
export async function fetchSalesPaginated(params = {}) {
  const response = await api.get('/sales', { params });
  if (Array.isArray(response.data)) {
    return { data: response.data, meta: { total: response.data.length, page: 1, limit: response.data.length, pages: 1 } };
  }
  return response.data;
}

export async function fetchSaleDetails(saleId) {
  const response = await api.get(`/sales/${saleId}`);
  return response.data;
}

export async function createSale(payload) {
  const response = await api.post('/sales', payload);
  return response.data;
}

export async function updateSale(saleId, payload) {
  const response = await api.put(`/sales/${saleId}`, payload);
  return response.data;
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

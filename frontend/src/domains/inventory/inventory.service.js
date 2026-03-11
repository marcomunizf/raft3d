import { api } from '../../services/api.js';

export async function fetchInventory(params = {}) {
  const response = await api.get('/inventory/items', { params });
  return response.data;
}

export async function createInventoryItem(payload) {
  await api.post('/inventory/items', payload);
}

export async function updateInventoryItem(itemId, payload) {
  await api.put(`/inventory/items/${itemId}`, payload);
}
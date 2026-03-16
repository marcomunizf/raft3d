import { api } from '../../services/api.js';

export async function fetchFinanceSummary(params = {}) {
  const response = await api.get('/finance/summary', { params });
  return response.data;
}

export async function fetchFinanceEntries(params = {}) {
  const response = await api.get('/finance/entries', { params });
  return response.data;
}

export async function createFinanceEntry(payload) {
  const response = await api.post('/finance/entries', payload);
  return response.data;
}

export async function updateFinanceEntry(id, payload) {
  const response = await api.put(`/finance/entries/${id}`, payload);
  return response.data;
}

export async function updateFinanceEntryStatus(id, payload) {
  const response = await api.patch(`/finance/entries/${id}/status`, payload);
  return response.data;
}

import { api } from '../../services/api.js';

/**
 * Retorna array de clientes (usado em autocomplete / CustomerSearch).
 * Extrai apenas o array data da resposta paginada.
 */
export async function fetchCustomers(params = {}) {
  const response = await api.get('/customers', { params });
  // Suporta tanto resposta paginada { data, meta } quanto array direto (retrocompat)
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
}

/**
 * Retorna resposta paginada completa { data, meta } para listagens com paginação.
 */
export async function fetchCustomersPaginated(params = {}) {
  const response = await api.get('/customers', { params });
  if (Array.isArray(response.data)) {
    return { data: response.data, meta: { total: response.data.length, page: 1, limit: response.data.length, pages: 1 } };
  }
  return response.data;
}

export async function createCustomer(payload) {
  await api.post('/customers', payload);
}

export async function updateCustomer(customerId, payload) {
  await api.put(`/customers/${customerId}`, payload);
}

export async function fetchCustomerSales(customerId) {
  const response = await api.get(`/customers/${customerId}/sales`);
  return response.data;
}
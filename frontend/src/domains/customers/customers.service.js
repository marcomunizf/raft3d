import { api } from '../../services/api.js';

export async function fetchCustomers(params = {}) {
  const response = await api.get('/customers', { params });
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
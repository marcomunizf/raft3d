import { api } from '../../services/api.js';

export async function fetchUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function createUser(payload) {
  await api.post('/users', payload);
}

export async function updateUser(userId, payload) {
  await api.put(`/users/${userId}`, payload);
}

export async function deleteUser(userId) {
  await api.delete(`/users/${userId}`);
}

export async function updateUserPassword(userId, payload) {
  await api.patch(`/users/${userId}/password`, payload);
}

export async function deactivateUser(userId) {
  await api.patch(`/users/${userId}/deactivate`);
}

import { api } from '../../services/api.js';

export async function fetchMaterials(params = {}) {
  const response = await api.get('/materials', { params });
  return response.data;
}

export async function createMaterial(payload) {
  const response = await api.post('/materials', payload);
  return response.data;
}

export async function updateMaterial(materialId, payload) {
  const response = await api.put(`/materials/${materialId}`, payload);
  return response.data;
}

export async function deactivateMaterial(materialId) {
  await api.patch(`/materials/${materialId}/deactivate`);
}

import { api } from '../../services/api.js';

export async function fetchDrawings(filters = {}) {
  const response = await api.get('/drawings', { params: filters });
  return response.data;
}

export async function fetchDrawingById(id) {
  const response = await api.get(`/drawings/${id}`);
  return response.data;
}

export async function fetchDrawingDesigners() {
  const response = await api.get('/drawings/designers');
  return response.data;
}

export async function createDrawing(payload) {
  const response = await api.post('/drawings', payload);
  return response.data;
}

export async function updateDrawing(id, payload) {
  const response = await api.put(`/drawings/${id}`, payload);
  return response.data;
}

export async function sendDrawingToProduction(id) {
  const response = await api.post(`/drawings/${id}/send-to-production`);
  return response.data;
}

export async function deleteDrawing(id) {
  await api.delete(`/drawings/${id}`);
}

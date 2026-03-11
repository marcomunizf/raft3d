import { api, setAuthToken } from '../../services/api.js';
import { parseJwt } from './auth.utils.js';

export async function loginWithCredentials({ usuario, senha }) {
  const response = await api.post('/auth/login', { usuario, senha });
  const token = response?.data?.token;

  if (!token) {
    throw new Error('Token ausente.');
  }

  const payload = parseJwt(token);

  localStorage.setItem('rr_token', token);
  setAuthToken(token);

  return {
    token,
    payload,
    usuario: response?.data?.usuario || null,
  };
}

export function restoreAuthSession() {
  const token = localStorage.getItem('rr_token');
  if (!token) return null;

  const payload = parseJwt(token);
  if (!payload) return null;

  setAuthToken(token);
  return { token, payload };
}

export function logoutSession() {
  localStorage.removeItem('rr_token');
  setAuthToken(null);
}
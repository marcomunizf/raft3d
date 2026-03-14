import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

const AUTH_INVALID_EVENT = 'rr-auth-invalid';

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('rr_token');
      setAuthToken(null);
      window.dispatchEvent(new Event(AUTH_INVALID_EVENT));
    }
    return Promise.reject(error);
  }
);

export { api, setAuthToken, AUTH_INVALID_EVENT };

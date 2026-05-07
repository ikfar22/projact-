import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartstock_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401/403 — auto-logout on invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('smartstock_token');
      localStorage.removeItem('smartstock_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  recordSale: (data) => api.post('/inventory/sale', data),
  transfer: (id, data) => api.post(`/inventory/${id}/transfer`, data),
  reconcile: (data) => api.post('/inventory/reconcile', data),
};

// Sales API
export const salesAPI = {
  getAll: () => api.get('/sales'),
};

// Logs API
export const logsAPI = {
  getAll: (limit = 20) => api.get(`/logs?limit=${limit}`),
};

export default api;

// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // CRITICAL: sends httpOnly cookie on every request
  timeout: 10000,
});

// Normalise errors from API
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Auth endpoints ────────────────────────────────────────────────
export const authService = {
  signup: (data)  => api.post('/auth/signup', data),
  login:  (data)  => api.post('/auth/login', data),
  logout: ()      => api.post('/auth/logout'),
  getMe:  ()      => api.get('/auth/me'),
};

// ── Product endpoints ─────────────────────────────────────────────
export const productService = {
  getAll:  (params) => api.get('/products', { params }),
  getById: (id)     => api.get(`/products/${id}`),
  create:  (data)   => api.post('/products', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  patch:   (id, data) => api.patch(`/products/${id}`, data),
  remove:  (id)     => api.delete(`/products/${id}`),
};

export default api;

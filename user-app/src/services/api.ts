import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api' 
  : 'https://your-production-api.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const profileApi = {
  get: () => api.get('/profile'),
  create: (data: any) => api.post('/profile', data),
  update: (data: any) => api.put('/profile', data),
};

export const medicationApi = {
  getAll: (activeOnly?: boolean) => api.get('/medications', { params: { active_only: activeOnly } }),
  get: (id: string) => api.get(`/medications/${id}`),
  create: (data: any) => api.post('/medications', data),
  update: (id: string, data: any) => api.put(`/medications/${id}`, data),
  delete: (id: string) => api.delete(`/medications/${id}`),
};

export const reportApi = {
  getAll: () => api.get('/reports'),
  get: (id: string) => api.get(`/reports/${id}`),
  create: (data: any) => api.post('/reports', data),
  update: (id: string, data: any) => api.put(`/reports/${id}`, data),
  delete: (id: string) => api.delete(`/reports/${id}`),
};

export const appointmentApi = {
  getAll: () => api.get('/appointments'),
  get: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

export const emergencyApi = {
  trigger: (latitude: number, longitude: number, address?: string) => 
    api.post('/emergency/trigger', { latitude, longitude, address }),
  getMyEmergencies: () => api.get('/emergency/my-emergencies'),
  get: (id: string) => api.get(`/emergency/${id}`),
};

export const hospitalApi = {
  getNearby: (latitude: number, longitude: number) => 
    api.get('/hospitals/nearby', { params: { latitude, longitude } }),
};
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
  error => {
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

export const hospitalApi = {
  register: (data: any) => api.post('/hospitals/register', data),
  getProfile: () => api.get('/hospitals/profile'),
  updateProfile: (data: any) => api.put('/hospitals/profile', data),
  searchPatients: (name?: string, phone?: string) => 
    api.post('/hospitals/patients/search', { name, phone }),
  getPatientDetails: (userId: string) => api.get(`/hospitals/patients/${userId}`),
  addMedication: (userId: string, data: any) => api.post(`/hospitals/patients/${userId}/medications`, data),
  addReport: (userId: string, data: any) => api.post(`/hospitals/patients/${userId}/reports`, data),
};

export const appointmentApi = {
  getAll: () => api.get('/appointments'),
  get: (id: string) => api.get(`/appointments/${id}`),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
};

export const emergencyApi = {
  getMyEmergencies: () => api.get('/emergency/my-emergencies'),
  get: (id: string) => api.get(`/emergency/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/emergency/${id}/status`, { status }),
};
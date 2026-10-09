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

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const ambulanceApi = {
  register: (data: any) => api.post('/ambulances/register', data),
  getProfile: () => api.get('/ambulances/profile'),
  updateLocation: (latitude: number, longitude: number) => api.put('/ambulances/location', { latitude, longitude }),
  updateStatus: (status: string) => api.put('/ambulances/status', { status }),
  getAssignedEmergency: () => api.get('/ambulances/assigned-emergency'),
  navigateToHospital: (hospitalId: string) => api.post('/ambulances/navigate-to-hospital', { hospital_id: hospitalId }),
  getNearbyHospitals: () => api.get('/ambulances/nearby-hospitals'),
};

export const emergencyApi = {
  getMyEmergencies: () => api.get('/emergency/my-emergencies'),
  get: (id: string) => api.get(`/emergency/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/emergency/${id}/status`, { status }),
  assignHospital: (id: string, hospitalId: string) => api.post(`/emergency/${id}/assign-hospital`, { hospital_id: hospitalId }),
};
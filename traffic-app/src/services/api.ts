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

export const trafficApi = {
  register: (data: any) => api.post('/traffic/register', data),
  getProfile: () => api.get('/traffic/profile'),
  getStatus: () => api.get('/traffic/status'),
  manualControl: (northSouthGreen: boolean, eastWestGreen: boolean) => 
    api.put('/traffic/manual-control', { north_south_green: northSouthGreen, east_west_green: eastWestGreen }),
};
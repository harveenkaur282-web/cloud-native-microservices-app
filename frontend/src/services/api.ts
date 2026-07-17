import axios from 'axios';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Also propagate the X-User-ID header if user info is stored
      const userId = localStorage.getItem('user_id');
      if (userId) {
        config.headers['X-User-ID'] = userId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Axios API Instance
 * 
 * Tự động attach Firebase token vào mọi request
 */

import axios from 'axios';
import { auth } from './firebase';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Tự động thêm Firebase token
api.interceptors.request.use(
  async (config) => {
    try {
      // Lấy current user từ Firebase
      const user = auth.currentUser;

      if (user) {
        // Lấy ID token từ Firebase
        const token = await user.getIdToken();

        // Attach vào Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting Firebase token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired hoặc invalid
      console.error('Unauthorized - Please login again');
      // Có thể redirect về login page
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
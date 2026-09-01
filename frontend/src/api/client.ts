import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000, // 25s timeout to handle free-tier cold starts gracefully
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('vk_auth_storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error reading auth token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Clear token and auth store if expired/revoked
      try {
        const authData = localStorage.getItem('vk_auth_storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed?.state?.token) {
            localStorage.removeItem('vk_auth_storage');
          }
        }
      } catch (e) {
        // silent
      }
    }
    return Promise.reject(error);
  }
);

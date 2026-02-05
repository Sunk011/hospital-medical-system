import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import type { ApiResponse } from '@/types';

// Create axios instance
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;

    // Check if response indicates an error
    if (data.code !== 200 && data.code !== 201) {
      ElMessage.error(data.message || 'Request failed');
      return Promise.reject(new Error(data.message || 'Request failed'));
    }

    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const authStore = useAuthStore();

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expired or invalid
          ElMessage.error('Session expired, please login again');
          authStore.logout();
          window.location.href = '/login';
          break;
        case 403:
          ElMessage.error('Access denied');
          break;
        case 404:
          ElMessage.error('Resource not found');
          break;
        case 429:
          ElMessage.error('Too many requests, please try again later');
          break;
        case 500:
          ElMessage.error('Server error, please try again later');
          break;
        default:
          ElMessage.error(data?.message || 'Request failed');
      }
    } else if (error.request) {
      ElMessage.error('Network error, please check your connection');
    } else {
      ElMessage.error('Request failed');
    }

    return Promise.reject(error);
  }
);

export default request;

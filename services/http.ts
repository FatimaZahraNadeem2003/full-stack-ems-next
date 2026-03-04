import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

http.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', {
        status: response.status,
        data: response.data,
      });
    }

    if (response.data?.message) {
      toast.success(response.data.message);
    }

    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('❌ Network Error:', error);
      console.error('🔍 API URL:', API_URL);
      console.error('💡 Make sure the backend server is running on port 5000');
      toast.error('Cannot connect to backend server. Please ensure it\'s running.');
      return Promise.reject(error);
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response Error:', {
        status: error.response.status,
        data: error.response.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        },
      });
    }

    switch (error.response.status) {
      case 400:
        toast.error(error.response.data?.msg || 'Bad request. Please check your input.');
        break;

      case 401:
        toast.error('Session expired. Please login again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
        break;

      case 403:
        toast.error('You do not have permission to perform this action.');
        break;

      case 404:
        toast.error('Resource not found.');
        break;

      case 422:
        toast.error(error.response.data?.msg || 'Validation error.');
        break;

      case 429:
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
      case 502:
      case 503:
        toast.error('Server error. Please try again later.');
        break;

      default:
        toast.error(error.response.data?.msg || 'An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default http;
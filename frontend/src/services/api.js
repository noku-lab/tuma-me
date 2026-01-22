import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout (increased from default 5s)
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request for debugging
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      hasToken: !!token
    });
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export default api;


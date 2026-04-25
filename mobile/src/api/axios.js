import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Update this to your backend server address
// For Android emulator use: http://10.0.2.2:5000
// For iOS simulator / physical device use your machine's local IP: http://192.168.x.x:5000
const BASE_URL = 'http://10.98.47.233:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Token expired or invalid
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
      }
    } else if (error.request) {
      // Network error — no response received
      console.error('Network Error: No response from server');
    }
    return Promise.reject(error);
  }
);

export default api;

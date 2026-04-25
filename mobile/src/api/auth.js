import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.98.47.233:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const loginWithClerk = async (token, clerkUser) => {
  try {
    const response = await api.post('/auth/clerk', {
      token,
      clerkUser: {
        id: clerkUser.id,
        fullName: clerkUser.fullName,
        firstName: clerkUser.firstName,
        primaryEmailAddress: clerkUser.primaryEmailAddress?.emailAddress,
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Clerk Login Error:', error.response?.data || error.message);
    throw error;
  }
};

export default api;

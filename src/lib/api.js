import axios from 'axios';

// Get API URL from env, default to current origin in browser or local Core API in SSR
const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : 'http://localhost/api/v1');
export const WS_URL = API_URL.replace(/^http/, 'ws');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend says "Unauthorized" (401), ensure frontend state knows it
    if (error.response?.status === 401) {
      // Optional: Trigger a global logout action here if you want to be aggressive
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);
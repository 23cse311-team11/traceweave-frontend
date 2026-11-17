import axios from 'axios';

// Get API URL: in browser, dynamically use current window origin unless an external API URL is explicitly configured
export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return `${window.location.origin}/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
};

const API_URL = typeof window !== 'undefined'
  ? ((process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost'))
      ? process.env.NEXT_PUBLIC_API_URL
      : `${window.location.origin}/api/v1`)
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1');

export const WS_URL = typeof window !== 'undefined'
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1`
  : API_URL.replace(/^http/, 'ws');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: dynamically resolve baseURL in browser to prevent stale localhost calls
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && (!config.baseURL || config.baseURL.includes('localhost')) && !window.location.hostname.includes('localhost')) {
    config.baseURL = `${window.location.origin}/api/v1`;
  }
  return config;
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
// Centralized API and Socket.IO configuration
const getBaseApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Automatically use fast local backend when developing locally
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return 'https://oibsip-6aid.vercel.app';
};

const RAW_API_URL = getBaseApiUrl();
const CLEAN_API_URL = RAW_API_URL.replace(/\/+$/, '');

// Ensure /api path is present for REST endpoints without duplicates
export const API_BASE_URL = CLEAN_API_URL.endsWith('/api')
  ? CLEAN_API_URL
  : `${CLEAN_API_URL}/api`;

// Base origin for Socket.IO without the /api suffix
export const SOCKET_URL = CLEAN_API_URL.replace(/\/api$/, '');

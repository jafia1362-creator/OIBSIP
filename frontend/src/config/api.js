// Centralized API and Socket.IO configuration
const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://oibsip-6aid.vercel.app';
const CLEAN_API_URL = RAW_API_URL.replace(/\/+$/, '');

// Ensure /api path is present for REST endpoints without duplicates
export const API_BASE_URL = CLEAN_API_URL.endsWith('/api')
  ? CLEAN_API_URL
  : `${CLEAN_API_URL}/api`;

// Base origin for Socket.IO without the /api suffix
export const SOCKET_URL = CLEAN_API_URL.replace(/\/api$/, '');

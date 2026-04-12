import axios from 'axios';

// Detect if we are running on a real mobile device or a web browser
const isNative = typeof window !== 'undefined' && (window.location.protocol === 'capacitor:' || window.location.hostname === 'localhost' && window.innerWidth < 800);

const API_BASE_URL = isNative 
  ? 'https://next-nova-one.vercel.app/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;

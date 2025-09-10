// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://your-backend-url.railway.app/api' : 'http://localhost:3001/api');

export { API_BASE_URL };

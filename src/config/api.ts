// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://sales-crm-backend.onrender.com/api' : 'http://localhost:3001/api');

export { API_BASE_URL };

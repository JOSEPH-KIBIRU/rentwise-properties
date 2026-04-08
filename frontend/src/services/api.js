import axios from 'axios';

// Make sure the URL ends with /api
const API_URL = import.meta.env.VITE_API_URL || 'https://rentwise-backend-xkcs.onrender.com/api';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // 20 second timeout for cold starts (Render free tier can be slow)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add a timestamp to help debug slow requests
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log request duration
api.interceptors.response.use(
  (response) => {
    // Log request duration for debugging
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      if (duration > 3000) {
        console.warn(`⚠️ Slow request: ${response.config.url} took ${duration}ms`);
      } else {
        console.log(`✅ ${response.config.url} completed in ${duration}ms`);
      }
    }
    return response;
  },
  (error) => {
    // Enhanced error handling for cold starts and network issues
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - possible cold start on Render');
      error.message = 'Server is waking up. Please try again in a moment.';
      error.isColdStart = true;
    } else if (error.message === 'Network Error') {
      console.error('Network error - server might be spinning up');
      error.message = 'Server is starting up. Please wait and try again.';
      error.isColdStart = true;
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check if server is healthy (can be used for keep-alive)
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.data.status === 'OK';
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
};

// Helper function to fetch with retry logic for cold starts
export const fetchWithRetry = async (url, options = {}, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${url}`);
        // Wait longer between retries (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
      
      const response = await api.get(url, options);
      return response;
    } catch (error) {
      lastError = error;
      
      // Only retry on cold start or timeout errors
      if (error.isColdStart || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        console.log(`Cold start detected for ${url}, will retry...`);
        continue;
      }
      
      // Don't retry on 4xx/5xx errors (except 503 which might be temporary)
      if (error.response?.status !== 503) {
        break;
      }
    }
  }
  
  throw lastError;
};

export default api;
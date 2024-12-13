import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production (Render), use relative path
  : `http://localhost:${process.env.PORT || 5000}/api`; // Local development

const instance = axios.create({
  baseURL,
  withCredentials: true
});

// Add a request interceptor for debugging
instance.interceptors.request.use(
    config => {
        console.log('Request:', config);
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for debugging
instance.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

export default instance; 
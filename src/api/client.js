import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:8000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('np_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('np_token');
      localStorage.removeItem('np_user');
      localStorage.removeItem('np_role');
      // Redirect handled by AuthContext or components
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor – attach token and handle FormData
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('uksm_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor – handle global errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, config } = error;
        if (response?.status === 401) {
            localStorage.removeItem('uksm_token');
            localStorage.removeItem('uksm_user');
            // Jangan redirect jika kita sedang berada di halaman login atau URL request adalah /auth/login
            if (window.location.pathname !== '/login' && (!config || !config.url || !config.url.includes('/auth/login'))) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

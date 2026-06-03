import axiosInstance from './axios';

// Ensure you call csrf cookie before login
export const getCsrfCookie = () =>
    axiosInstance.get('/sanctum/csrf-cookie', {
        baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:8000'
    });

// Auth
export const loginApi = async (email, password, turnstileToken) => {
    await getCsrfCookie();
    return axiosInstance.post('/auth/login', { email, password, turnstile_token: turnstileToken }).then(r => r.data);
};

export const getMeApi = () =>
    axiosInstance.get('/auth/me').then(r => r.data);

export const logoutApi = () =>
    axiosInstance.post('/auth/logout').then(r => r.data);

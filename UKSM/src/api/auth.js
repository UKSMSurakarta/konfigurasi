import axiosInstance from './axios';

// Auth
export const loginApi = (email, password, turnstileToken) =>
    axiosInstance.post('/auth/login', { email, password, turnstile_token: turnstileToken }).then(r => r.data);

export const getMeApi = () =>
    axiosInstance.get('/auth/me').then(r => r.data);

export const logoutApi = () =>
    axiosInstance.post('/auth/logout').then(r => r.data);

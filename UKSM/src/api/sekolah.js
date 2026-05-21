import axiosInstance from './axios';

// Dashboard sekolah
export const getSekolahDashboardApi = () =>
    axiosInstance.get('/sekolah/dashboard').then(r => r.data);

// Assessment – daftar level + status
export const getSekolahLevelsApi = () =>
    axiosInstance.get('/sekolah/levels').then(r => r.data);

// Pertanyaan per level
export const getPertanyaanLevelApi = (levelId) =>
    axiosInstance.get(`/sekolah/levels/${levelId}/pertanyaans`).then(r => r.data);

// Simpan jawaban
export const saveJawabanApi = (levelId, jawabans) =>
    axiosInstance.post(`/sekolah/levels/${levelId}/jawab`, { jawabans }).then(r => r.data);

// Submit final level
export const submitFinalLevelApi = (levelId) =>
    axiosInstance.post(`/sekolah/levels/${levelId}/submit-final`).then(r => r.data);

// Upload bukti
export const uploadBuktiApi = (formData) =>
    axiosInstance.post('/sekolah/upload-bukti', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);

// Profil sekolah
export const getSekolahProfileApi = () =>
    axiosInstance.get('/sekolah/profile').then(r => r.data);

export const updateSekolahProfileApi = (data) =>
    axiosInstance.put('/sekolah/profile', data).then(r => r.data);

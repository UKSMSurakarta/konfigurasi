import axiosInstance from "./axios";

// Dashboard
export const getAdminDashboardApi = (params) =>
  axiosInstance.get("/admin/dashboard", { params }).then((r) => r.data);

export const getAdminMonitoringApi = (params) =>
  axiosInstance.get("/admin/monitoring", { params }).then((r) => r.data);

// Sekolah (Admin)
export const getAdminSekolahsApi = (params) =>
  axiosInstance.get("/admin/sekolahs", { params }).then((r) => r.data);
export const getAdminSekolahDetailApi = (id) =>
  axiosInstance.get(`/admin/sekolahs/${id}`).then((r) => r.data);
export const createAdminSekolahApi = (data) =>
  axiosInstance.post("/admin/sekolahs", data).then((r) => r.data);
export const updateAdminSekolahApi = (id, data) =>
  axiosInstance.put(`/admin/sekolahs/${id}`, data).then((r) => r.data);
export const deleteAdminSekolahApi = (id) =>
  axiosInstance.delete(`/admin/sekolahs/${id}`).then((r) => r.data);

// Verifikasi
export const getVerifikasiListApi = () =>
  axiosInstance.get("/admin/verifikasi").then((r) => r.data);
export const verifikasiSekolahApi = (sekolahId, levelId, data) =>
  axiosInstance
    .post(`/admin/verifikasi/${sekolahId}/level/${levelId}`, data)
    .then((r) => r.data);

export const getSekolahAssessmentDetailApi = (sekolahId) =>
  axiosInstance
    .get(`/admin/verifikasi/sekolah/${sekolahId}`)
    .then((r) => r.data);

// Laporan
export const getRekapSekolahApi = (params) =>
  axiosInstance
    .get("/admin/laporan/rekap-sekolah", { params })
    .then((r) => r.data);
export const getRekapLevelApi = (params) =>
  axiosInstance
    .get("/admin/laporan/rekap-level", { params })
    .then((r) => r.data);
export const getDetailSekolahLaporanApi = (sekolahId, params) =>
  axiosInstance
    .get(`/admin/laporan/detail-sekolah/${sekolahId}`, { params })
    .then((r) => r.data);

// Levels (Bank Soal)
export const getAdminLevelsApi = () =>
  axiosInstance.get("/admin/levels").then((r) => r.data);
export const createAdminLevelApi = (data) =>
  axiosInstance.post("/admin/levels", data).then((r) => r.data);
export const updateAdminLevelApi = (id, data) =>
  axiosInstance.put(`/admin/levels/${id}`, data).then((r) => r.data);
export const deleteAdminLevelApi = (id) =>
  axiosInstance.delete(`/admin/levels/${id}`).then((r) => r.data);
export const toggleAdminLevelApi = (id) =>
  axiosInstance.patch(`/admin/levels/${id}/toggle`).then((r) => r.data);
export const getPertanyaansByLevelApi = (levelId) =>
  axiosInstance.get(`/admin/levels/${levelId}/pertanyaans`).then((r) => r.data);
export const createPertanyaanApi = (levelId, data) =>
  axiosInstance
    .post(`/admin/levels/${levelId}/pertanyaans`, data)
    .then((r) => r.data);
export const updatePertanyaanApi = (id, data) =>
  axiosInstance.put(`/admin/pertanyaans/${id}`, data).then((r) => r.data);
export const deletePertanyaanApi = (id) =>
  axiosInstance.delete(`/admin/pertanyaans/${id}`).then((r) => r.data);

// Pengumuman Admin
export const getPengumumansAdminApi = () =>
  axiosInstance.get("/admin/pengumumans").then((r) => r.data);
export const createPengumumanAdminApi = (data) =>
  axiosInstance.post("/admin/pengumumans", data).then((r) => r.data);
export const updatePengumumanAdminApi = (id, data) =>
  axiosInstance.put(`/admin/pengumumans/${id}`, data).then((r) => r.data);
export const deletePengumumanAdminApi = (id) =>
  axiosInstance.delete(`/admin/pengumumans/${id}`).then((r) => r.data);

// Konten (role: user, admin, superadmin)
export const getKontensApi = (params) =>
  axiosInstance.get("/user/kontens", { params }).then((r) => r.data);
export const createKontenApi = (data) =>
  axiosInstance.post("/user/kontens", data).then((r) => r.data);

export const updateKontenApi = (id, data) => {
  // Laravel expects PUT/PATCH method, but when using FormData, we often need to spoof it with POST + _method
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return axiosInstance.post(`/user/kontens/${id}`, data).then((r) => r.data);
  }
  return axiosInstance.put(`/user/kontens/${id}`, data).then((r) => r.data);
};

export const deleteKontenApi = (id) =>
  axiosInstance.delete(`/user/kontens/${id}`).then((r) => r.data);

export const togglePublishKontenApi = (id) =>
  axiosInstance.patch(`/user/kontens/${id}/publish`).then((r) => r.data);

export const getKontenDetailApi = (id) =>
  axiosInstance.get(`/user/kontens/${id}`).then((r) => r.data);

export const uploadKontenImageApi = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosInstance
    .post("/user/kontens/upload-image", formData)
    .then((r) => r.data);
};

// Pengaturan Sertifikat
export const getPengaturanSertifikatApi = () =>
  axiosInstance.get("/admin/pengaturan-sertifikat").then((r) => r.data);

export const updatePengaturanSertifikatApi = (data) =>
  axiosInstance.post("/admin/pengaturan-sertifikat", data).then((r) => r.data);

// Superadmin Sertifikat (Manual Issue)
export const getSuperadminCertificatesApi = (params) =>
  axiosInstance.get("/superadmin/certificates", { params }).then((r) => r.data);

export const getSuperadminCertificateDetailApi = (sekolahId) =>
  axiosInstance.get(`/superadmin/certificates/${sekolahId}`).then((r) => r.data);

export const issueSuperadminCertificateApi = (sekolahId, data) =>
  axiosInstance.post(`/superadmin/certificates/${sekolahId}/issue`, data).then((r) => r.data);

export const rejectSuperadminCertificateApi = (sekolahId, data) =>
  axiosInstance.post(`/superadmin/certificates/${sekolahId}/reject`, data).then((r) => r.data);

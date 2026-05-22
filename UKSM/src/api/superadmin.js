import axiosInstance from "./axios";

// Dashboard
export const getSuperadminDashboardApi = () =>
  axiosInstance.get("/superadmin/dashboard").then((r) => r.data);

export const getSuperadminMonitoringApi = (params) =>
  axiosInstance.get("/superadmin/monitoring", { params }).then((r) => r.data);

// Users
export const getUsersApi = (params) =>
  axiosInstance.get("/superadmin/users", { params }).then((r) => r.data);
export const getUserRolesApi = () =>
  axiosInstance.get("/superadmin/users/roles").then((r) => r.data);
export const createUserApi = (data) =>
  axiosInstance.post("/superadmin/users", data).then((r) => r.data);
export const updateUserApi = (id, data) =>
  axiosInstance.put(`/superadmin/users/${id}`, data).then((r) => r.data);
export const deleteUserApi = (id) =>
  axiosInstance.delete(`/superadmin/users/${id}`).then((r) => r.data);
export const toggleUserActiveApi = (id) =>
  axiosInstance
    .patch(`/superadmin/users/${id}/toggle-active`)
    .then((r) => r.data);
export const resetUserPasswordApi = (id) =>
  axiosInstance
    .post(`/superadmin/users/${id}/reset-password`)
    .then((r) => r.data);

// Sekolah
export const getSekolahsApi = (params) =>
  axiosInstance.get("/superadmin/sekolahs", { params }).then((r) => r.data);
export const createSekolahApi = (data) =>
  axiosInstance.post("/superadmin/sekolahs", data).then((r) => r.data);
export const updateSekolahApi = (id, data) =>
  axiosInstance.put(`/superadmin/sekolahs/${id}`, data).then((r) => r.data);
export const deleteSekolahApi = (id) =>
  axiosInstance.delete(`/superadmin/sekolahs/${id}`).then((r) => r.data);

// OPD
export const getOpdsApi = (params) =>
  axiosInstance.get("/superadmin/opds", { params }).then((r) => r.data);
export const createOpdApi = (data) =>
  axiosInstance.post("/superadmin/opds", data).then((r) => r.data);
export const updateOpdApi = (id, data) =>
  axiosInstance.put(`/superadmin/opds/${id}`, data).then((r) => r.data);
export const deleteOpdApi = (id) =>
  axiosInstance.delete(`/superadmin/opds/${id}`).then((r) => r.data);

// Periods
export const getPeriodsApi = (params) =>
  axiosInstance.get("/superadmin/periods", { params }).then((r) => r.data);
export const createPeriodApi = (data) =>
  axiosInstance.post("/superadmin/periods", data).then((r) => r.data);
export const updatePeriodApi = (id, data) =>
  axiosInstance.put(`/superadmin/periods/${id}`, data).then((r) => r.data);
export const deletePeriodApi = (id) =>
  axiosInstance.delete(`/superadmin/periods/${id}`).then((r) => r.data);
export const togglePeriodApi = (id) =>
  axiosInstance
    .patch(`/superadmin/periods/${id}/toggle-active`)
    .then((r) => r.data);

// Pengumuman Superadmin
export const getPengumumansSuperadminApi = () =>
  axiosInstance.get("/superadmin/pengumumans").then((r) => r.data);
export const createPengumumanSuperadminApi = (data) =>
  axiosInstance.post("/superadmin/pengumumans", data).then((r) => r.data);
export const updatePengumumanSuperadminApi = (id, data) =>
  axiosInstance.put(`/superadmin/pengumumans/${id}`, data).then((r) => r.data);
export const deletePengumumanSuperadminApi = (id) =>
  axiosInstance.delete(`/superadmin/pengumumans/${id}`).then((r) => r.data);
export const getOpdListForPengumumanApi = () =>
  axiosInstance.get("/superadmin/pengumumans-opd-list").then((r) => r.data);

// Konten (accessible via /user/kontens for role superadmin)
export const getKontensApi = (params) =>
  axiosInstance.get("/user/kontens", { params }).then((r) => r.data);

export const createKontenApi = (data) =>
  axiosInstance.post("/user/kontens", data).then((r) => r.data);

export const updateKontenApi = (id, data) => {
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

export const uploadKontenImageApi = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosInstance.post("/user/kontens/upload-image", formData).then((r) => r.data);
};

// Laporan Superadmin (uses dashboard + monitoring)
export const getSuperadminLaporanApi = (params) =>
  axiosInstance.get("/superadmin/monitoring", { params }).then((r) => r.data);
export const getSuperadminDashboardStatsApi = () =>
  axiosInstance.get("/superadmin/dashboard").then((r) => r.data);

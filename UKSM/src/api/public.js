import axiosInstance from "./axios";

export const getPublicBeritaApi = (params) =>
  axiosInstance.get("/public/berita", { params }).then((r) => r.data);

export const getPublicBeritaDetailApi = (slug) =>
  axiosInstance.get(`/public/berita/${slug}`).then((r) => r.data);

export const getPublicPengumumanApi = (params) =>
  axiosInstance.get("/public/pengumuman", { params }).then((r) => r.data);

export const getPublicAgendaApi = (params) =>
  axiosInstance.get("/public/agenda", { params }).then((r) => r.data);

export const getPublicGaleriApi = (params) =>
  axiosInstance.get("/public/galeri", { params }).then((r) => r.data);

export const getPublicRankingSekolahApi = (params) =>
  axiosInstance.get("/public/ranking-sekolah", { params }).then((r) => r.data);

export const getPublicStatistikApi = () =>
  axiosInstance.get("/public/statistik").then((r) => r.data);

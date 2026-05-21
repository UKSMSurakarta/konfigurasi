/* =============================================================
   TIERS — Data kuisioner assessment UKS (4 tier)
   Digunakan di: sekolahAssessment, sekolahHasilPenilaian,
                 SuperAdminassessment, AdminVerifikasi
============================================================= */
export const TIERS = {
  dasar: {
    label: "Dasar",
    color: "#185FA5",
    bgColor: "#E6F1FB",
    questions: [
      "Pendidikan kesehatan diintegrasikan dalam Intrakurikuler",
      "Sekolah melaksanakan kegiatan aksi hidup sehat (makan sehat dan bergizi, aktivitas fisik, CTPS dan kebersihan diri)",
      "Sekolah melaksanakan kegiatan Aksi Bergizi (senam pagi, sarapan bersama, minum Tablet Tambah Darah bagi peserta didik Putri, pendidikan gizi)",
      "Sekolah memiliki sarana prasarana olahraga",
      "Sekolah memfasilitasi puskesmas melaksanakan Deteksi Dini Tumbuh Kembang dan skrining kesehatan",
      "Sekolah melaksanakan pelayanan P3K (pertolongan pertama pada kecelakaan) dan P3P (pertolongan pertama pada penyakit)",
      "Sekolah memfasilitasi Puskesmas melakukan imunisasi (SD dan SMP/Sederajat)",
      "Sekolah melakukan pemberian Vitamin A (PAUD/Sederajat) dan obat cacing (SD/Sederajat)",
      "Sekolah melakukan pemberian Tablet Tambah Darah (SMP dan SMA/Sederajat)",
      "Sekolah memiliki ruang kesehatan/ruang UKS dengan peralatan & perlengkapan ruang UKS",
      "Sekolah memiliki sumber air layak dan cukup",
      "Sekolah memiliki tempat cuci tangan dengan sabun dan air mengalir",
      "Sekolah memiliki toilet dengan kondisi baik dan terpisah",
      "Sekolah memiliki lahan/ruang terbuka hijau",
      "Sekolah memiliki tempat sampah permanen yang tertutup dan mudah dibersihkan di tiap kelas",
      "Ruang Kelas dalam keadaan bersih dan sehat (memiliki ventilasi udara dan pencahayaan yang memadai)",
      "Sekolah menerapkan kebijakan Kawasan Tanpa Rokok dan NAPZA",
      "Sekolah melaksanakan pemberantasan sarang nyamuk yang terjadwal 1 kali/minggu",
      "Sekolah memiliki kebijakan tertulis tentang penyelenggaraan kesehatan sekolah termasuk SK Tim Pelaksana",
      "Sekolah memiliki rencana kerja kesehatan sekolah",
      "Ada larangan merokok di lingkungan sekolah",
      "Sekolah memiliki sumber informasi terkait kesehatan sekolah",
      "Sekolah melaksanakan asesmen mandiri",
    ],
  },
  madya: {
    label: "Madya",
    color: "#3B6D11",
    bgColor: "#EAF3DE",
    questions: [
      "Pendidikan kesehatan diintegrasikan dalam kegiatan ekstra kurikuler",
      "Sekolah melaksanakan layanan konseling kesehatan oleh Guru BK/Wali Kelas yang ditunjuk dan terlatih",
      "Sekolah memiliki tempat sampah tertutup dan terpilah di tiap kelas",
      "Sekolah memiliki kantin sehat atau menjamin penyediaan pangan sehat",
      "Sekolah memiliki Satgas atau Pokja pencegahan kekerasan",
      "Sekolah memiliki saluran drainase permanen dan tidak ada air yang tergenang",
    ],
  },
  utama: {
    label: "Utama",
    color: "#854F0B",
    bgColor: "#FAEEDA",
    questions: [
      "Pendidikan kesehatan diintegrasikan dalam kegiatan kokurikuler",
      "Sekolah bersama Puskesmas melakukan rujukan peserta didik yang sakit/cedera",
      "Sekolah menindaklanjuti hasil skrining kesehatan",
      "Sekolah memanfaatkan pekarangan sekolah dengan menanam tanaman obat dan pangan",
      "Sekolah melakukan 3R terhadap pengelolaan sampah (Reduce, reuse, recycle)",
      "Sekolah menerapkan lingkungan inklusif bagi peserta didik dengan disabilitas",
      "Sekolah menerapkan kesiapsiagaan bencana (memiliki jalur evakuasi, titik kumpul, alat pemadam)",
      "Sekolah melakukan pembinaan Duta kesehatan sekolah/Dokter kecil",
    ],
  },
  paripurna: {
    label: "Paripurna",
    color: "#993556",
    bgColor: "#FBEAF0",
    questions: [
      "Sekolah menerapkan pendidikan karakter dan keterampilan hidup sehat",
      "Sekolah melaksanakan pelayanan P3LP (pertolongan pertama pada luka psikologis)",
      "Sekolah menyediakan air minum",
      "Sekolah memiliki rasio toilet sesuai dengan standar (1:40 siswa dan 1:25 siswi)",
      "Kantin telah mendapatkan sertifikat kantin sehat",
      "Tersedia toilet yang dapat diakses penyandang disabilitas",
      "Sekolah bekerjasama dengan puskesmas melakukan Inspeksi Kesehatan Lingkungan (IKL)",
      "Sekolah bekerjasama dengan pihak lain untuk menyediakan bank sampah",
      "Sekolah melaksanakan pencatatan dan pelaporan kegiatan UKS",
      "Sekolah melaksanakan pemantauan dan evaluasi program UKS",
      "Sekolah melaksanakan orientasi kesehatan sekolah kepada semua pendidik dan tenaga kependidikan",
    ],
  },
};

/* =============================================================
   SCHOOLS — Daftar akun sekolah demo
   Digunakan di: AuthContext, LoginPage, sekolahProfil
============================================================= */
export const SCHOOLS = [
  { id: "1", name: "SDN 011 Laweyan",    username: "sekolah",     password: "sekolah123", jenjang: "SD",  wilayah: "Laweyan",    opd: "Dinkes Surakarta", npsn: "20328011", kepala: "Budi Santoso, S.Pd.", telp: "0271-712345", email: "sdn011laweyan@surakarta.sch.id", alamat: "Jl. Dr. Rajiman No. 23, Laweyan, Surakarta" },
  { id: "2", name: "SMPN 05 Banjarsari", username: "sekolah_smp", password: "sekolah123", jenjang: "SMP", wilayah: "Banjarsari", opd: "Dinkes Surakarta", npsn: "20328052", kepala: "Dewi Rahayu, M.Pd.",  telp: "0271-734567", email: "smpn5banjarsari@surakarta.sch.id", alamat: "Jl. Sumpah Pemuda No. 45, Banjarsari, Surakarta" },
  { id: "3", name: "SMAN 02 Serengan",   username: "sekolah_sma", password: "sekolah123", jenjang: "SMA", wilayah: "Serengan",   opd: "Dinkes Surakarta", npsn: "20328023", kepala: "Ahmad Fauzi, M.M.",   telp: "0271-756789", email: "sman2serengan@surakarta.sch.id",  alamat: "Jl. Veteran No. 77, Serengan, Surakarta" },
];

export const ADMIN_CREDENTIALS   = { username: "admin",      password: "admin123" };
export const SUPERADMIN_CREDENTIALS = { username: "superadmin", password: "super123" };
export const KONTEN_CREDENTIALS   = { username: "konten",     password: "konten123" };

/* =============================================================
   PREDIKAT UKS — Tingkatan predikat hasil verifikasi
   Digunakan di: AdminVerifikasi, sekolahHasilPenilaian, SuperAdminassessment
============================================================= */
export const PREDIKAT_UKS = [
  { key: "dasar",      label: "Dasar",      color: "#185FA5", bg: "#E6F1FB", deskripsi: "Sekolah telah memenuhi indikator dasar penyelenggaraan UKS.", minScore: 0  },
  { key: "madya",      label: "Madya",      color: "#3B6D11", bg: "#EAF3DE", deskripsi: "Sekolah telah memenuhi indikator dasar dan madya UKS dengan baik.", minScore: 23 },
  { key: "utama",      label: "Utama",      color: "#854F0B", bg: "#FAEEDA", deskripsi: "Sekolah telah memenuhi sebagian besar indikator UKS termasuk tier utama.", minScore: 29 },
  { key: "paripurna",  label: "Paripurna",  color: "#993556", bg: "#FBEAF0", deskripsi: "Sekolah telah memenuhi seluruh indikator UKS secara paripurna.", minScore: 37 },
];

/* =============================================================
   PERIODE — Data periode assessment
   Digunakan di: SuperAdminperiode, SuperadminDashboard, SekolahDashboard, AdminDashboard
============================================================= */
export const PERIODE_LIST = [
  { id: 1, nama: "Ganjil 2026/2027", mulai: "01 Jul 2026", selesai: "31 Des 2026", deadline: "30 Jun 2027", status: "Aktif",   sekolahIkut: 1450 },
  { id: 2, nama: "Genap 2025/2026",  mulai: "01 Jan 2026", selesai: "30 Jun 2026", deadline: "30 Jun 2026", status: "Selesai", sekolahIkut: 1380 },
  { id: 3, nama: "Ganjil 2025/2026", mulai: "01 Jul 2025", selesai: "31 Des 2025", deadline: "31 Des 2025", status: "Selesai", sekolahIkut: 1250 },
];
export const PERIODE_AKTIF = PERIODE_LIST.find((p) => p.status === "Aktif") || PERIODE_LIST[0];

/* =============================================================
   JENJANG & STATUS OPTIONS
   Digunakan di: AdminVerifikasi, SuperAdminassessment, Adminlaporan, SuperAdminSekolah
============================================================= */
export const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK", "PAUD"];

export const STATUS_OPTIONS = [
  { label: "Semua Status",         value: "" },
  { label: "Selesai",              value: "Selesai" },
  { label: "Menunggu Verifikasi",  value: "Menunggu Verifikasi" },
  { label: "Terverifikasi",        value: "Terverifikasi" },
  { label: "Belum Selesai",        value: "Belum Selesai" },
  { label: "Proses",               value: "Proses" },
];

/* =============================================================
   OPD LIST — Dinas Kesehatan per wilayah
   Digunakan di: SuperAdminlaporan, SuperAdminSekolah, SuperadminDashboard, Adminlaporan
============================================================= */
export const OPD_LIST = [
  { id: 1, nama: "Dinkes Surakarta",  wilayah: "Surakarta",  totalSekolah: 320, selesai: 280, menunggu: 20, belum: 20, persentase: 87 },
  { id: 2, nama: "Dinkes Nusantara",  wilayah: "Nusantara",  totalSekolah: 210, selesai: 145, menunggu: 30, belum: 35, persentase: 69 },
  { id: 3, nama: "Dinkes Sukamaju",   wilayah: "Sukamaju",   totalSekolah: 180, selesai: 110, menunggu: 20, belum: 50, persentase: 61 },
  { id: 4, nama: "Dinkes Teknologi",  wilayah: "Teknologi",  totalSekolah: 140, selesai: 90,  menunggu: 10, belum: 40, persentase: 64 },
  { id: 5, nama: "Dinkes Maju Jaya",  wilayah: "Maju Jaya",  totalSekolah: 100, selesai: 55,  menunggu: 5,  belum: 40, persentase: 55 },
];

/* =============================================================
   SCHOOL REGISTRY — Daftar sekolah lengkap
   Digunakan di: AdminVerifikasi, SuperAdminassessment, SuperAdminSekolah, laporan
============================================================= */
export const SCHOOL_REGISTRY = [
  { id: "1",  nama: "SDN 011 Laweyan",      jenjang: "SD",  opd: "Dinkes Surakarta", wilayah: "Laweyan",    progress: 100, status: "Menunggu Verifikasi", predikat: null,    certificateReady: false },
  { id: "2",  nama: "SMPN 05 Banjarsari",   jenjang: "SMP", opd: "Dinkes Surakarta", wilayah: "Banjarsari", progress: 0,   status: "Belum Selesai",       predikat: null,    certificateReady: false },
  { id: "3",  nama: "SMAN 02 Serengan",     jenjang: "SMA", opd: "Dinkes Surakarta", wilayah: "Serengan",   progress: 60,  status: "Proses",               predikat: null,    certificateReady: false },
  { id: "4",  nama: "SDN Sukamaju 01",      jenjang: "SD",  opd: "Dinkes Sukamaju",  wilayah: "Sukamaju",   progress: 100, status: "Terverifikasi",        predikat: "Madya", certificateReady: true  },
  { id: "5",  nama: "SMPN 4 Surakarta",     jenjang: "SMP", opd: "Dinkes Surakarta", wilayah: "Surakarta",  progress: 76,  status: "Menunggu Verifikasi",  predikat: null,    certificateReady: false },
  { id: "6",  nama: "SMAN 1 Nusantara",     jenjang: "SMA", opd: "Dinkes Nusantara", wilayah: "Nusantara",  progress: 48,  status: "Proses",               predikat: null,    certificateReady: false },
  { id: "7",  nama: "SMKN Teknologi 02",    jenjang: "SMK", opd: "Dinkes Teknologi", wilayah: "Teknologi",  progress: 88,  status: "Menunggu Verifikasi",  predikat: null,    certificateReady: false },
  { id: "8",  nama: "SDN Baru 03",          jenjang: "SD",  opd: "Dinkes Nusantara", wilayah: "Nusantara",  progress: 22,  status: "Belum Selesai",        predikat: null,    certificateReady: false },
  { id: "9",  nama: "SD Islam Cahaya",      jenjang: "SD",  opd: "Dinkes Sukamaju",  wilayah: "Sukamaju",   progress: 45,  status: "Proses",               predikat: null,    certificateReady: false },
  { id: "10", nama: "SMKN Maju Bersama",    jenjang: "SMK", opd: "Dinkes Maju Jaya", wilayah: "Maju Jaya",  progress: 100, status: "Terverifikasi",        predikat: "Utama", certificateReady: true  },
];

/* =============================================================
   PENGUMUMAN LIST
   Digunakan di: SekolahDashboard, AdminDashboard, SuperadminDashboard
============================================================= */
export const PENGUMUMAN_LIST = [
  { id: 1, judul: "Batas Akhir Pengisian Assessment",   isi: "Batas akhir pengisian penilaian UKS adalah tanggal 30 Juni 2027. Pastikan semua indikator telah diisi.", tipe: "warning", tanggal: "10 Mei 2026", role: ["sekolah","admin"] },
  { id: 2, judul: "Verifikasi Tahap 2 Dimulai",         isi: "Tim verifikator wilayah akan mulai melakukan validasi dokumen mulai minggu depan.", tipe: "info", tanggal: "8 Mei 2026",  role: ["admin","superadmin"] },
  { id: 3, judul: "Jadwal Verifikasi Lapangan",         isi: "Kunjungan verifikasi lapangan dijadwalkan tanggal 20-30 Juni 2026.", tipe: "info", tanggal: "7 Mei 2026",  role: ["sekolah"] },
  { id: 4, judul: "Update Sistem Penilaian",            isi: "Sistem SI-UKS DIGITAL telah diperbarui. Harap refresh halaman untuk mendapatkan versi terbaru.", tipe: "success", tanggal: "5 Mei 2026", role: ["sekolah","admin","superadmin","konten"] },
  { id: 5, judul: "Pelatihan Admin Wilayah",            isi: "Pelatihan operator admin wilayah akan dilaksanakan secara daring pada tanggal 15 Mei 2026.", tipe: "info", tanggal: "3 Mei 2026", role: ["admin","superadmin"] },
  { id: 6, judul: "Publikasi Hasil Assessment 2025",    isi: "Hasil assessment UKS periode 2025 telah dipublikasikan. Silakan unduh laporan melalui menu Laporan.", tipe: "success", tanggal: "1 Mei 2026", role: ["superadmin"] },
];

/* =============================================================
   BERITA / KONTEN LIST
   Digunakan di: KontenDashboard, SuperAdminkonten, LandingPage
============================================================= */
export const KONTEN_LIST = [
  { id: 1, judul: "Tips Menjaga Kesehatan Lingkungan Sekolah",      kategori: "Edukasi",    penulis: "Tim UKS Pusat",    tanggal: "12 Mei 2026", status: "Diterbitkan", views: 1240, thumbnail: "" },
  { id: 2, judul: "Sekolah Sehat: Kunci Prestasi Siswa",            kategori: "Berita",     penulis: "Redaksi",          tanggal: "10 Mei 2026", status: "Diterbitkan", views: 980,  thumbnail: "" },
  { id: 3, judul: "Pengumuman Hasil Penilaian UKS 2025",            kategori: "Pengumuman", penulis: "Admin Pusat",      tanggal: "8 Mei 2026",  status: "Diterbitkan", views: 2350, thumbnail: "" },
  { id: 4, judul: "Galeri Kegiatan Sekolah Sehat Nasional 2025",    kategori: "Galeri",     penulis: "Tim UKS Pusat",    tanggal: "5 Mei 2026",  status: "Diterbitkan", views: 760,  thumbnail: "" },
  { id: 5, judul: "SDN Sukamaju 01 Raih Predikat UKS Madya",        kategori: "Prestasi",   penulis: "Redaksi",          tanggal: "3 Mei 2026",  status: "Diterbitkan", views: 1580, thumbnail: "" },
  { id: 6, judul: "Panduan Pengisian Kuisioner UKS Digital",        kategori: "Edukasi",    penulis: "Tim Teknis",       tanggal: "1 Mei 2026",  status: "Draft",       views: 0,    thumbnail: "" },
  { id: 7, judul: "Workshop Kesehatan Remaja di Era Digital",       kategori: "Berita",     penulis: "Redaksi",          tanggal: "28 Apr 2026", status: "Diterbitkan", views: 640,  thumbnail: "" },
  { id: 8, judul: "Inovasi Program UKS Berbasis Teknologi",         kategori: "Edukasi",    penulis: "Tim UKS Pusat",    tanggal: "25 Apr 2026", status: "Arsip",       views: 410,  thumbnail: "" },
];

/* =============================================================
   GALERI LIST
   Digunakan di: KontenGaleriMedia
============================================================= */
export const GALERI_LIST = [
  { id: 1, judul: "Senam Pagi Bersama",          kategori: "Foto",  ukuran: "2.4 MB", tanggal: "12 Mei 2026", status: "Aktif" },
  { id: 2, judul: "Kunjungan Tim Verifikator",   kategori: "Foto",  ukuran: "1.8 MB", tanggal: "10 Mei 2026", status: "Aktif" },
  { id: 3, judul: "Profil SI-UKS Digital",       kategori: "Video", ukuran: "48 MB",  tanggal: "8 Mei 2026",  status: "Aktif" },
  { id: 4, judul: "Kantin Sehat SDN Laweyan",    kategori: "Foto",  ukuran: "3.1 MB", tanggal: "5 Mei 2026",  status: "Aktif" },
  { id: 5, judul: "Ruang UKS Standar Nasional",  kategori: "Foto",  ukuran: "2.7 MB", tanggal: "3 Mei 2026",  status: "Nonaktif" },
  { id: 6, judul: "Sosialisasi Program UKS",     kategori: "Video", ukuran: "72 MB",  tanggal: "1 Mei 2026",  status: "Aktif" },
];

/* =============================================================
   KATEGORI KONTEN
   Digunakan di: SuperAdminkonten, KontenGaleriMedia, KontenDashboard
============================================================= */
export const KATEGORI_KONTEN = [
  { value: "Berita",     label: "Berita",     color: "#1D4ED8", bg: "#DBEAFE" },
  { value: "Edukasi",    label: "Edukasi",    color: "#15803D", bg: "#DCFCE7" },
  { value: "Galeri",     label: "Galeri",     color: "#BE185D", bg: "#FCE7F3" },
  { value: "Pengumuman", label: "Pengumuman", color: "#B45309", bg: "#FEF3C7" },
  { value: "Prestasi",   label: "Prestasi",   color: "#7C3AED", bg: "#EDE9FE" },
];

/* =============================================================
   USERS REGISTRY
   Digunakan di: SuperAdminusers
============================================================= */
export const USERS_REGISTRY = [
  { id: 1, nama: "Admin Surakarta",      username: "admin",        role: "admin",      instansi: "Dinkes Surakarta",  status: "Aktif",    createdAt: "1 Jan 2026" },
  { id: 2, nama: "Kepala Sekolah",       username: "sekolah",      role: "sekolah",    instansi: "SDN 011 Laweyan",   status: "Aktif",    createdAt: "1 Jan 2026" },
  { id: 3, nama: "Pengelola Publikasi",  username: "konten",       role: "konten",     instansi: "Pusat",             status: "Aktif",    createdAt: "1 Jan 2026" },
  { id: 4, nama: "Superadmin Pusat",     username: "superadmin",   role: "superadmin", instansi: "Pusat",             status: "Aktif",    createdAt: "1 Jan 2026" },
  { id: 5, nama: "Admin Nusantara",      username: "admin_nusa",   role: "admin",      instansi: "Dinkes Nusantara",  status: "Nonaktif", createdAt: "15 Feb 2026" },
  { id: 6, nama: "Operator SMPN 4",      username: "sekolah_smp4", role: "sekolah",    instansi: "SMPN 4 Surakarta",  status: "Aktif",    createdAt: "20 Feb 2026" },
];

/* =============================================================
   CERTIFICATE CONFIG — Konfigurasi template sertifikat
   Digunakan di: CertificateTemplate, sekolahHasilPenilaian
============================================================= */
export const CERTIFICATE_CONFIG = {
  issuer:      "Dinas Kesehatan Kota Surakarta",
  program:     "Sistem Informasi UKS Digital (SI-UKS)",
  tahunAjaran: "2026/2027",
  ttdNama:     "dr. Siti Rahayu, M.Kes.",
  ttdJabatan:  "Kepala Dinas Kesehatan Kota Surakarta",
  logoUrl:     "/logo-uks.png",
  warnaPrima:  "#0f4c75",
  warnaAksent: "#1b9e6e",
};

/* =============================================================
   PROFIL FIELDS — Field data profil sekolah
   Digunakan di: sekolahProfil
============================================================= */
export const PROFIL_FIELDS = [
  { key: "name",    label: "Nama Sekolah",      type: "text",   required: true },
  { key: "npsn",    label: "NPSN",              type: "text",   required: true },
  { key: "jenjang", label: "Jenjang",           type: "select", required: true,  options: ["SD","SMP","SMA","SMK","PAUD"] },
  { key: "wilayah", label: "Kecamatan/Wilayah", type: "text",   required: true },
  { key: "opd",     label: "OPD / Dinkes",      type: "text",   required: true },
  { key: "kepala",  label: "Nama Kepala Sekolah", type: "text", required: true },
  { key: "telp",    label: "No. Telepon",        type: "text",   required: false },
  { key: "email",   label: "Email Sekolah",      type: "email",  required: false },
  { key: "alamat",  label: "Alamat Lengkap",     type: "textarea", required: true },
];

/* =============================================================
   STATS CONFIG — Statistik ringkasan per role
   Digunakan di: SekolahDashboard, AdminDashboard, SuperadminDashboard
============================================================= */
export function getAdminStats(registry = SCHOOL_REGISTRY) {
  const total      = registry.length;
  const selesai    = registry.filter(s => s.status === "Selesai" || s.status === "Terverifikasi").length;
  const menunggu   = registry.filter(s => s.status === "Menunggu Verifikasi").length;
  const belum      = registry.filter(s => s.status === "Belum Selesai").length;
  return { total, selesai, menunggu, belum };
}

export function getSuperadminStats() {
  const totalOpd      = OPD_LIST.length;
  const totalSekolah  = OPD_LIST.reduce((a, o) => a + o.totalSekolah, 0);
  const totalSelesai  = OPD_LIST.reduce((a, o) => a + o.selesai, 0);
  const persen        = Math.round((totalSelesai / totalSekolah) * 100);
  return { totalOpd, totalSekolah, totalSelesai, persen, periodeAktif: PERIODE_AKTIF.nama };
}
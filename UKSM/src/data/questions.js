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
export const SCHOOLS = [];

export const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };
export const SUPERADMIN_CREDENTIALS = { username: "superadmin", password: "super123" };
export const KONTEN_CREDENTIALS = { username: "konten", password: "konten123" };

/* =============================================================
   PREDIKAT UKS — Tingkatan predikat hasil verifikasi
   Digunakan di: AdminVerifikasi, sekolahHasilPenilaian, SuperAdminassessment
============================================================= */
export const PREDIKAT_UKS = [
  { key: "dasar", label: "Dasar", color: "#185FA5", bg: "#E6F1FB", deskripsi: "Sekolah telah memenuhi indikator dasar penyelenggaraan UKS.", minScore: 0 },
  { key: "madya", label: "Madya", color: "#3B6D11", bg: "#EAF3DE", deskripsi: "Sekolah telah memenuhi indikator dasar dan madya UKS dengan baik.", minScore: 23 },
  { key: "utama", label: "Utama", color: "#854F0B", bg: "#FAEEDA", deskripsi: "Sekolah telah memenuhi sebagian besar indikator UKS termasuk tier utama.", minScore: 29 },
  { key: "paripurna", label: "Paripurna", color: "#993556", bg: "#FBEAF0", deskripsi: "Sekolah telah memenuhi seluruh indikator UKS secara paripurna.", minScore: 37 },
];

/* =============================================================
   PERIODE — Data periode assessment
   Digunakan di: SuperAdminperiode, SuperadminDashboard, SekolahDashboard, AdminDashboard
============================================================= */
export const PERIODE_LIST = [];
export const PERIODE_AKTIF = PERIODE_LIST.find((p) => p.status === "Aktif") || PERIODE_LIST[0] || { nama: "Periode Saat Ini" };

/* =============================================================
   JENJANG & STATUS OPTIONS
   Digunakan di: AdminVerifikasi, SuperAdminassessment, Adminlaporan, SuperAdminSekolah
============================================================= */
export const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK", "PAUD"];

export const STATUS_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Selesai", value: "Selesai" },
  { label: "Menunggu Verifikasi", value: "Menunggu Verifikasi" },
  { label: "Terverifikasi", value: "Terverifikasi" },
  { label: "Belum Selesai", value: "Belum Selesai" },
  { label: "Proses", value: "Proses" },
];

/* =============================================================
   OPD LIST — Dinas Kesehatan per wilayah
   Digunakan di: SuperAdminlaporan, SuperAdminSekolah, SuperadminDashboard, Adminlaporan
============================================================= */
export const OPD_LIST = [];

/* =============================================================
   SCHOOL REGISTRY — Daftar sekolah lengkap
   Digunakan di: AdminVerifikasi, SuperAdminassessment, SuperAdminSekolah, laporan
============================================================= */
export const SCHOOL_REGISTRY = [];

/* =============================================================
   PENGUMUMAN LIST
   Digunakan di: SekolahDashboard, AdminDashboard, SuperadminDashboard
============================================================= */
export const PENGUMUMAN_LIST = [];

/* =============================================================
   BERITA / KONTEN LIST
   Digunakan di: KontenDashboard, SuperAdminkonten, LandingPage
============================================================= */
export const KONTEN_LIST = [];

/* =============================================================
   GALERI LIST
   Digunakan di: KontenGaleriMedia
============================================================= */
export const GALERI_LIST = [];

/* =============================================================
   KATEGORI KONTEN
   Digunakan di: SuperAdminkonten, KontenGaleriMedia, KontenDashboard
============================================================= */
export const KATEGORI_KONTEN = [
  { value: "Berita", label: "Berita", color: "#1D4ED8", bg: "#DBEAFE" },
  { value: "Edukasi", label: "Edukasi", color: "#15803D", bg: "#DCFCE7" },
  { value: "Galeri", label: "Galeri", color: "#BE185D", bg: "#FCE7F3" },
  { value: "Pengumuman", label: "Pengumuman", color: "#B45309", bg: "#FEF3C7" },
  { value: "Prestasi", label: "Prestasi", color: "#7C3AED", bg: "#EDE9FE" },
];

/* =============================================================
   USERS REGISTRY
   Digunakan di: SuperAdminusers
============================================================= */
export const USERS_REGISTRY = [];

/* =============================================================
   CERTIFICATE CONFIG — Konfigurasi template sertifikat
   Digunakan di: CertificateTemplate, sekolahHasilPenilaian
============================================================= */
export const CERTIFICATE_CONFIG = {
  issuer: "Dinas Kesehatan Kota Surakarta",
  program: "Sistem Informasi UKS Digital (SI-UKS)",
  tahunAjaran: "2026/2027",
  ttdNama: "dr. Siti Rahayu, M.Kes.",
  ttdJabatan: "Kepala Dinas Kesehatan Kota Surakarta",
  logoUrl: "/logo-uks.png",
  warnaPrima: "#0f4c75",
  warnaAksent: "#1b9e6e",
};

/* =============================================================
   PROFIL FIELDS — Field data profil sekolah
   Digunakan di: sekolahProfil
============================================================= */
export const PROFIL_FIELDS = [
  { key: "name", label: "Nama Sekolah", type: "text", required: true },
  { key: "npsn", label: "NPSN", type: "text", required: true },
  { key: "jenjang", label: "Jenjang", type: "select", required: true, options: ["SD", "SMP", "SMA", "SMK", "PAUD"] },
  { key: "wilayah", label: "Kecamatan/Wilayah", type: "text", required: true },
  { key: "opd", label: "OPD / Dinkes", type: "text", required: true },
  { key: "kepala", label: "Nama Kepala Sekolah", type: "text", required: true },
  { key: "telp", label: "No. Telepon", type: "text", required: false },
  { key: "email", label: "Email Sekolah", type: "email", required: false },
  { key: "alamat", label: "Alamat Lengkap", type: "textarea", required: true },
];

/* =============================================================
   STATS CONFIG — Statistik ringkasan per role
   Digunakan di: SekolahDashboard, AdminDashboard, SuperadminDashboard
============================================================= */
export function getAdminStats(registry = SCHOOL_REGISTRY) {
  const total = registry.length;
  const selesai = registry.filter(s => s.status === "Selesai" || s.status === "Terverifikasi").length;
  const menunggu = registry.filter(s => s.status === "Menunggu Verifikasi").length;
  const belum = registry.filter(s => s.status === "Belum Selesai").length;
  return { total, selesai, menunggu, belum };
}

export function getSuperadminStats() {
  const totalOpd = OPD_LIST.length;
  const totalSekolah = OPD_LIST.reduce((a, o) => a + o.totalSekolah, 0);
  const totalSelesai = OPD_LIST.reduce((a, o) => a + o.selesai, 0);
  const persen = Math.round((totalSelesai / totalSekolah) * 100);
  return { totalOpd, totalSekolah, totalSelesai, persen, periodeAktif: PERIODE_AKTIF.nama };
}
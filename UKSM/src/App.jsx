import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UKSProvider } from "./context/UKSContext";
import Toast from "./components/Toast";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
const SemuaArtikel = lazy(() => import("./pages/SemuaArtikel"));
const PublicKontenPreview = lazy(() => import("./pages/PublicKontenPreview"));

import DashboardLayout from "./components/layout/DashboardLayout";
const SekolahDashboard = lazy(() => import("./pages/sekolah/SekolahDashboard"));
const SekolahAssessment = lazy(() => import("./pages/sekolah/sekolahAssessment"));
const SekolahHasilPenilaian = lazy(() => import("./pages/sekolah/sekolahHasilPenilaian"));
const SekolahProfil = lazy(() => import("./pages/sekolah/sekolahProfil"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminVerifikasi = lazy(() => import("./pages/admin/AdminVerifikasi"));
const AdminVerifikasiDetail = lazy(() => import("./pages/admin/AdminVerifikasiDetail"));
const AdminKelolaSekolah = lazy(() => import("./pages/admin/AdminKelolaSekolah"));
const Adminlaporan = lazy(() => import("./pages/admin/Adminlaporan"));
const AdminPengaturanSertifikat = lazy(() => import("./pages/admin/AdminPengaturanSertifikat"));
const SuperadminDashboard = lazy(() => import("./pages/superadmin/SuperadminDashboard"));
const SuperadminManajemenOPD = lazy(() => import("./pages/superadmin/SuperadminManajemenOPD"));
const SuperAdminSekolah = lazy(() => import("./pages/superadmin/SuperAdminSekolah"));
const SuperAdminusers = lazy(() => import("./pages/superadmin/SuperAdminusers"));
const SuperAdminassessment = lazy(() => import("./pages/superadmin/SuperAdminassessment"));
const SuperAdminManajemenSoal = lazy(() => import("./pages/superadmin/SuperAdminManajemenSoal"));
const SuperAdminperiode = lazy(() => import("./pages/superadmin/SuperAdminperiode"));
const SuperAdminlaporan = lazy(() => import("./pages/superadmin/SuperAdminlaporan"));
const SuperAdminLaporanDetail = lazy(() => import("./pages/superadmin/SuperAdminLaporanDetail"));
const SuperAdminkonten = lazy(() => import("./pages/superadmin/SuperAdminkonten"));
const SuperAdminkontenDesain = lazy(() => import("./pages/superadmin/SuperAdminkontenDesain"));
const KontenDashboard = lazy(() => import("./pages/konten/KontenDashboard"));
const KontenDesain = lazy(() => import("./pages/konten/KontenDesain"));
const KontenPreview = lazy(() => import("./pages/konten/KontenPreview"));
const KontenGaleriMedia = lazy(() => import("./pages/konten/KontenGaleriMedia"));

// Role-based redirect map
const ROLE_HOME = {
  superadmin: "/superadmin/dashboard",
  admin: "/admin/dashboard",
  sekolah: "/sekolah/dashboard",
  konten: "/konten/dashboard",
  user: "/konten/dashboard", // 'user' role dari backend = konten
};

// Protected route – redirect to login if not authenticated, or to role home if wrong role
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #e5e7eb",
            borderTop: "3px solid #0F6E56",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-gray-200 border-t-[#0F6E56] rounded-full animate-spin"></div></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/semua-artikel" element={<SemuaArtikel />} />
        <Route path="/artikel/:slug" element={<PublicKontenPreview />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── Sekolah ── */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["sekolah"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/sekolah/dashboard" element={<SekolahDashboard />} />
          <Route path="/sekolah/profil" element={<SekolahProfil />} />
          <Route path="/sekolah/kuesioner" element={<SekolahAssessment />} />
          <Route path="/sekolah/hasil" element={<SekolahHasilPenilaian />} />
        </Route>

        {/* ── Admin OPD ── */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/verifikasi" element={<AdminVerifikasi />} />
          <Route
            path="/admin/verifikasi/:sekolahId"
            element={<AdminVerifikasiDetail />}
          />
          <Route path="/admin/sekolah" element={<AdminKelolaSekolah />} />
          <Route path="/admin/laporan" element={<Adminlaporan />} />
          <Route path="/admin/pengaturan-sertifikat" element={<AdminPengaturanSertifikat />} />
        </Route>

        {/* ── Superadmin ── */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/superadmin/dashboard"
            element={<SuperadminDashboard />}
          />
          <Route
            path="/superadmin/manajemen"
            element={<SuperadminManajemenOPD />}
          />
          <Route path="/superadmin/sekolah" element={<SuperAdminSekolah />} />
          <Route path="/superadmin/users" element={<SuperAdminusers />} />
          <Route
            path="/superadmin/assessment"
            element={<SuperAdminassessment />}
          />
          <Route
            path="/superadmin/manajemen-soal"
            element={<SuperAdminManajemenSoal />}
          />
          <Route path="/superadmin/verifikasi" element={<AdminVerifikasi />} />
          <Route
            path="/superadmin/verifikasi/:sekolahId"
            element={<AdminVerifikasiDetail />}
          />
          <Route path="/superadmin/periode" element={<SuperAdminperiode />} />
          <Route path="/superadmin/laporan" element={<SuperAdminlaporan />} />
          <Route path="/superadmin/laporan/:opdId" element={<SuperAdminLaporanDetail />} />
          <Route path="/superadmin/konten" element={<SuperAdminkonten />} />
          <Route
            path="/superadmin/konten-desain"
            element={<SuperAdminkontenDesain />}
          />
          <Route path="/superadmin/preview/:id" element={<KontenPreview />} />
        </Route>

        {/* ── Konten ── */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["konten", "user"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/konten/dashboard" element={<KontenDashboard />} />
          <Route path="/konten/desain" element={<KontenDesain />} />
          <Route path="/konten/preview/:id" element={<KontenPreview />} />
          <Route path="/konten/galeri" element={<KontenGaleriMedia />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <UKSProvider>
      <AuthProvider>
        <Toast />
        <AppRouter />
      </AuthProvider>
    </UKSProvider>
  );
}

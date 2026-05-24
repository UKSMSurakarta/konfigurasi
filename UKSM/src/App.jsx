import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UKSProvider } from "./context/UKSContext";
import Toast from "./components/Toast";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";

import DashboardLayout from "./components/layout/DashboardLayout";
import SekolahDashboard from "./pages/sekolah/SekolahDashboard";
import SekolahAssessment from "./pages/sekolah/sekolahAssessment";
import SekolahHasilPenilaian from "./pages/sekolah/sekolahHasilPenilaian";
import SekolahProfil from "./pages/sekolah/sekolahProfil";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVerifikasi from "./pages/admin/AdminVerifikasi";
import Adminlaporan from "./pages/admin/Adminlaporan";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import SuperadminManajemenOPD from "./pages/superadmin/SuperadminManajemenOPD";
import SuperAdminSekolah from "./pages/superadmin/SuperAdminSekolah";
import SuperAdminusers from "./pages/superadmin/SuperAdminusers";
import SuperAdminassessment from "./pages/superadmin/SuperAdminassessment";
import SuperAdminManajemenSoal from "./pages/superadmin/SuperAdminManajemenSoal";
import SuperAdminperiode from "./pages/superadmin/SuperAdminperiode";
import SuperAdminlaporan from "./pages/superadmin/SuperAdminlaporan";
import SuperAdminkonten from "./pages/superadmin/SuperAdminkonten";
import SuperAdminkontenDesain from "./pages/superadmin/SuperAdminkontenDesain";
import KontenDashboard from "./pages/konten/KontenDashboard";
import KontenDesain from "./pages/konten/KontenDesain";
import KontenPreview from "./pages/konten/KontenPreview";
import KontenGaleriMedia from "./pages/konten/KontenGaleriMedia";

// Role-based redirect map
const ROLE_HOME = {
    superadmin: "/superadmin/dashboard",
    admin: "/admin/dashboard",
    sekolah: "/sekolah/dashboard",
    konten: "/konten/dashboard",
    user: "/konten/dashboard",  // 'user' role dari backend = konten
};

// Protected route – redirect to login if not authenticated, or to role home if wrong role
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                    width: 40, height: 40, border: "3px solid #e5e7eb",
                    borderTop: "3px solid #0F6E56", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }} />
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
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* ── Sekolah ── */}
                <Route element={<ProtectedRoute allowedRoles={["sekolah"]}><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/sekolah/dashboard" element={<SekolahDashboard />} />
                    <Route path="/sekolah/profil" element={<SekolahProfil />} />
                    <Route path="/sekolah/kuesioner" element={<SekolahAssessment />} />
                    <Route path="/sekolah/hasil" element={<SekolahHasilPenilaian />} />
                </Route>

                {/* ── Admin OPD ── */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/verifikasi" element={<AdminVerifikasi />} />
                    <Route path="/admin/sekolah" element={<AdminDashboard />} />
                    <Route path="/admin/laporan" element={<Adminlaporan />} />
                </Route>

                {/* ── Superadmin ── */}
                <Route element={<ProtectedRoute allowedRoles={["superadmin"]}><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/superadmin/dashboard" element={<SuperadminDashboard />} />
                    <Route path="/superadmin/manajemen" element={<SuperadminManajemenOPD />} />
                    <Route path="/superadmin/sekolah" element={<SuperAdminSekolah />} />
                    <Route path="/superadmin/users" element={<SuperAdminusers />} />
                    <Route path="/superadmin/assessment" element={<SuperAdminassessment />} />
                    <Route path="/superadmin/manajemen-soal" element={<SuperAdminManajemenSoal />} />
                    <Route path="/superadmin/verifikasi" element={<AdminVerifikasi />} />
                    <Route path="/superadmin/periode" element={<SuperAdminperiode />} />
                    <Route path="/superadmin/laporan" element={<SuperAdminlaporan />} />
                    <Route path="/superadmin/konten" element={<SuperAdminkonten />} />
                    <Route path="/superadmin/konten-desain" element={<SuperAdminkontenDesain />} />
                    <Route path="/superadmin/preview/:id" element={<KontenPreview />} />
                </Route>

                {/* ── Konten ── */}
                <Route element={<ProtectedRoute allowedRoles={["konten", "user"]}><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/konten/dashboard" element={<KontenDashboard />} />
                    <Route path="/konten/desain" element={<KontenDesain />} />
                    <Route path="/konten/preview/:id" element={<KontenPreview />} />
                    <Route path="/konten/galeri" element={<KontenGaleriMedia />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  FileText,
  CheckSquare,
  Settings,
  Users,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  FileBarChart,
  Globe,
  CalendarDays,
  Image,
} from "lucide-react";

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user, logout } = useAuth();

  const role = user?.role || "sekolah";

  const menus = {
    sekolah: [
      { path: "/sekolah/dashboard",  label: "Dashboard",       icon: <LayoutDashboard size={20} /> },
      { path: "/sekolah/profil",     label: "Profil Sekolah",  icon: <Building2 size={20} /> },
      { path: "/sekolah/kuesioner",  label: "Self-Assessment", icon: <CheckSquare size={20} /> },
      { path: "/sekolah/hasil",      label: "Hasil Penilaian", icon: <ShieldCheck size={20} /> },
    ],
    admin: [
      { path: "/admin/dashboard",  label: "Dashboard Admin",  icon: <LayoutDashboard size={20} /> },
      { path: "/admin/verifikasi", label: "Verifikasi",       icon: <CheckSquare size={20} /> },
      { path: "/admin/sekolah",    label: "Kelola Sekolah",   icon: <Building2 size={20} /> },
      { path: "/admin/laporan",    label: "Laporan & Analisis", icon: <FileBarChart size={20} /> },
    ],
    superadmin: [
      { path: "/superadmin/dashboard",  label: "Dashboard Pusat",    icon: <LayoutDashboard size={20} /> },
      { path: "/superadmin/manajemen",  label: "Manajemen OPD",      icon: <Globe size={20} /> },
      { path: "/superadmin/sekolah",    label: "Manajemen Sekolah",  icon: <Building2 size={20} /> },
      { path: "/superadmin/users",      label: "Manajemen User",     icon: <Users size={20} /> },
      { path: "/superadmin/assessment", label: "Assessment",         icon: <CheckSquare size={20} /> },
      { path: "/superadmin/periode",    label: "Periode Assessment", icon: <CalendarDays size={20} /> },
      { path: "/superadmin/laporan",    label: "Laporan & Rekap",    icon: <FileBarChart size={20} /> },
      { path: "/superadmin/konten",     label: "Konten Website",     icon: <FileText size={20} /> },
    ],
    konten: [
      { path: "/konten/dashboard", label: "Dashboard",       icon: <LayoutDashboard size={20} /> },
      { path: "/konten/desain",    label: "Editor Artikel",  icon: <FileText size={20} /> },
      { path: "/konten/berita",    label: "Berita & Artikel", icon: <Home size={20} /> },
      { path: "/konten/galeri",    label: "Galeri Media",    icon: <Image size={20} /> },
    ],
  };

  const activeMenu = menus[role] || menus.sekolah;

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2 className="flex items-center gap-2" style={{ color: "white" }}>
          <ShieldCheck size={28} />
          UKS Modern
        </h2>
      </div>

      <nav className="sidebar-nav">
        {activeMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          className="nav-item w-full"
          onClick={logout}
          style={{ background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

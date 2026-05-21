import { Menu, Bell, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="flex items-center gap-4">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold" style={{ display: "none", margin: 0 }}>
          {/* We can show title if needed, or hide it on desktop since sidebar has it */}
          <span className="md:inline-block">Dashboard</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="btn btn-outline" style={{ padding: "0.5rem", borderRadius: "50%", border: "none" }}>
          <Bell size={20} className="text-muted" />
        </button>
        <div className="flex items-center gap-2">
          <div style={{ textAlign: "right", display: "none" }} className="md:block">
            <div className="text-sm font-bold">{user?.username || "Guest"}</div>
            <div className="text-sm text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>{user?.role || "Unknown"}</div>
          </div>
          <UserCircle size={32} className="text-primary" />
        </div>
      </div>
    </header>
  );
}

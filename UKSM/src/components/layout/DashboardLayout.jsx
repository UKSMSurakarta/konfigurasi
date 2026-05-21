import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ allowedRoles }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${sidebarOpen ? "open" : ""}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="content-area animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

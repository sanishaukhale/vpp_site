import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { SITE_INFO } from "../../constants/siteInfo";
import "./Admin.css";

// Simple custom SVG icons to avoid importing heavy libraries if not needed,
// but since lucide-react is installed, let's use standard Lucide icons!
import { 
  Home, 
  Layers, 
  FileText, 
  Briefcase, 
  Users, 
  Settings, 
  Activity,
  Bell, 
  LogOut, 
  Menu, 
  X,
  FileCheck,
  ShieldAlert
} from "lucide-react";

const AdminLayout = () => {
  const { userProfile, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close overlays on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsNotifOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isSuper = userProfile?.role === "super_admin";
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-sidebar-logo">
            <img 
              src="/logo.png" 
              alt="Swami Vivekananda Logo" 
              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} 
            />
            <div className="admin-sidebar-logo-text">
              <span className="navbar-logo-name">{SITE_INFO.shortName}</span>
              <span className="navbar-logo-tagline">CMS</span>
            </div>
          </Link>
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User profile brief card */}
        <div className="admin-sidebar-user">
          <div className="admin-user-name">{userProfile?.fullName || "Admin"}</div>
          <div className="admin-user-role">
            {isSuper ? "Super Admin" : "Volunteer Admin"}
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-title">Core</div>
          
          <NavLink 
            to={isSuper ? "/admin/super-dashboard" : "/admin/dashboard"} 
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>

          {isSuper && (
            <NavLink 
              to="/admin/approval-center" 
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
            >
              <FileCheck size={18} />
              <span>Approval Center</span>
            </NavLink>
          )}

          <div className="admin-nav-section-title">Content CRUD</div>
          
          <NavLink 
            to="/admin/activities" 
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <Activity size={18} />
            <span>Activities</span>
          </NavLink>

          <NavLink 
            to="/admin/projects" 
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <Briefcase size={18} />
            <span>Projects</span>
          </NavLink>

          <NavLink 
            to="/admin/articles" 
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <FileText size={18} />
            <span>Articles</span>
          </NavLink>

          <NavLink 
            to="/admin/team" 
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <Users size={18} />
            <span>Team Members</span>
          </NavLink>

          {isSuper && (
            <>
              <div className="admin-nav-section-title">Administration</div>
              
              <NavLink 
                to="/admin/management" 
                className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              >
                <Users size={18} />
                <span>Admin Users</span>
              </NavLink>

              <NavLink 
                to="/admin/audit-logs" 
                className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              >
                <ShieldAlert size={18} />
                <span>Audit Logs</span>
              </NavLink>

              <NavLink 
                to="/admin/settings" 
                className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="btn-logout" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            width: "100%",
            padding: "0.5rem",
            fontSize: "0.9rem",
            textAlign: "left"
          }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button 
              className="admin-hamburger-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem",
                color: "var(--color-text)"
              }}
            >
              <Menu size={24} />
            </button>
            <h1 className="admin-topbar-title font-playfair">CMS Control Panel</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* Notification Bell Icon */}
            <div className="notif-bell" onClick={() => setIsNotifOpen(!isNotifOpen)}>
              <Bell size={20} />
              {unreadNotifs.length > 0 && (
                <span className="notif-badge">{unreadNotifs.length}</span>
              )}
            </div>
          </div>
        </header>

        {/* Notification Slide Panel */}
        {isNotifOpen && (
          <div className="notif-panel">
            <div className="notif-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Notifications</span>
              <button 
                onClick={() => setIsNotifOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}
              >
                Close
              </button>
            </div>
            
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`notif-item ${!notif.read ? "unread" : ""}`}
                    onClick={() => {
                      if (!notif.read) {
                        markNotificationAsRead(notif.id);
                      }
                      // Navigate if needed based on relatedType
                      if (notif.relatedType && isSuper) {
                        if (notif.type === "submission") {
                          navigate("/admin/approval-center");
                        } else {
                          navigate(`/admin/${notif.relatedType}`);
                        }
                      }
                    }}
                  >
                    <div className="notif-item-title">{notif.title}</div>
                    <div className="notif-item-msg">{notif.message}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-light)", marginTop: "4px" }}>
                      {new Date(notif.createdAt?.seconds * 1000 || notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Active Route Render Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

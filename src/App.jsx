import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { DataProvider, useData } from "./context/DataContext";
import { SITE_INFO } from "./constants/siteInfo";

// Layouts & Guards
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./pages/Admin/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";
import { RequireAuth, RequireAnon, RequireRole } from "./components/AuthGuards";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Activities from "./pages/Activities";
import ActivityDetail from "./pages/ActivityDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Support from "./pages/Support";

// Admin Pages
import Login from "./pages/Admin/Login";
import Suspended from "./pages/Admin/Suspended";
import Dashboard from "./pages/Admin/Dashboard";
import SuperDashboard from "./pages/Admin/SuperDashboard";
import ApprovalCenter from "./pages/Admin/ApprovalCenter";
import AdminManagement from "./pages/Admin/AdminManagement";
import AuditLogs from "./pages/Admin/AuditLogs";
import Settings from "./pages/Admin/Settings";

// Admin CRUDs
import ActivitiesAdmin from "./pages/Admin/ActivitiesAdmin";
import ProjectsAdmin from "./pages/Admin/ProjectsAdmin";
import ArticlesAdmin from "./pages/Admin/ArticlesAdmin";
import TeamAdmin from "./pages/Admin/TeamAdmin";

/**
 * Handles App-wide loading splash screen, Coming Soon redirects, and Maintenance covers
 */
const AppStateWrapper = ({ children }) => {
  const { systemSettings, loading } = useData();
  const location = useLocation();

  // Admin routes always bypass coming soon & maintenance screens
  const isAdminPath = location.pathname.startsWith("/admin");

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="spinner"></div>
        <p className="font-playfair text-gradient" style={{ marginTop: "1rem", fontWeight: "600" }}>
          Loading {SITE_INFO.shortName}...
        </p>
      </div>
    );
  }

  if (!isAdminPath) {
    // 1. Coming Soon mode (Bypass on localhost / 127.0.0.1)
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (systemSettings.comingSoon && !isLocal) {
      return (
        <div className="admin-login-page" style={{ flexDirection: "column" }}>
          <div className="admin-login-card card" style={{ color: "var(--color-text)", padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
            <h1 className="font-playfair" style={{ color: "var(--color-secondary)", fontSize: "2.5rem" }}>Coming Soon</h1>
            <p style={{ margin: "1.5rem 0", color: "var(--color-text-light)", lineHeight: "1.6" }}>
              Our new digital portal is currently under construction and will launch shortly.
            </p>
            <p style={{ fontWeight: "700", color: "var(--color-primary)" }}>{SITE_INFO.tagline}</p>
            <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border-light)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Contact: {SITE_INFO.email} | {SITE_INFO.phone}
            </div>
          </div>
        </div>
      );
    }

    // 2. Maintenance mode cover
    if (systemSettings.maintenanceMode) {
      return (
        <div className="admin-login-page" style={{ flexDirection: "column" }}>
          <div className="admin-login-card card" style={{ color: "var(--color-text)", padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚙️</div>
            <h1 className="font-playfair" style={{ color: "var(--color-secondary)", fontSize: "2rem" }}>Under Maintenance</h1>
            <p style={{ margin: "1.5rem 0", color: "var(--color-text-light)", lineHeight: "1.6" }}>
              We are currently running system upgrades to enhance your browsing experience. We will be back online soon.
            </p>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              For urgent inquiries: {SITE_INFO.email}
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <ScrollToTop />
            <AppStateWrapper>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="activities" element={<Activities />} />
                  <Route path="activities/:id" element={<ActivityDetail />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="articles" element={<Articles />} />
                  <Route path="articles/:id" element={<ArticleDetail />} />
                  <Route path="team" element={<Team />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="support" element={<Support />} />
                </Route>

                {/* Admin Standalone Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <RequireAnon>
                      <Login />
                    </RequireAnon>
                  } 
                />
                <Route 
                  path="/admin/suspended" 
                  element={
                    <RequireAuth>
                      <Suspended />
                    </RequireAuth>
                  } 
                />

                {/* Admin Nested Control Dashboard Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <RequireAuth>
                      <AdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route 
                    path="dashboard" 
                    element={
                      <RequireRole allowedRoles={["admin"]}>
                        <Dashboard />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="super-dashboard" 
                    element={
                      <RequireRole allowedRoles={["super_admin"]}>
                        <SuperDashboard />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="approval-center" 
                    element={
                      <RequireRole allowedRoles={["super_admin"]}>
                        <ApprovalCenter />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="management" 
                    element={
                      <RequireRole allowedRoles={["super_admin"]}>
                        <AdminManagement />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="audit-logs" 
                    element={
                      <RequireRole allowedRoles={["super_admin"]}>
                        <AuditLogs />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="settings" 
                    element={
                      <RequireRole allowedRoles={["super_admin"]}>
                        <Settings />
                      </RequireRole>
                    } 
                  />

                  {/* Shared Admin CRUDs */}
                  <Route 
                    path="activities" 
                    element={
                      <RequireRole allowedRoles={["admin", "super_admin"]}>
                        <ActivitiesAdmin />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="projects" 
                    element={
                      <RequireRole allowedRoles={["admin", "super_admin"]}>
                        <ProjectsAdmin />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="articles" 
                    element={
                      <RequireRole allowedRoles={["admin", "super_admin"]}>
                        <ArticlesAdmin />
                      </RequireRole>
                    } 
                  />
                  <Route 
                    path="team" 
                    element={
                      <RequireRole allowedRoles={["admin", "super_admin"]}>
                        <TeamAdmin />
                      </RequireRole>
                    } 
                  />

                  {/* Redirect unmatched admin routes to dashboard */}
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>

                {/* Redirect any other unmatched public route to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppStateWrapper>
          </Router>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3500,
              style: {
                background: "#333",
                color: "#fff",
                fontSize: "14px",
                borderRadius: "8px"
              }
            }} 
          />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

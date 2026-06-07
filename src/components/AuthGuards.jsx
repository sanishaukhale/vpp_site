import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guard that requires users to be authenticated.
 * Redirects unauthenticated users to /admin login page.
 * Redirects suspended users to /admin/suspended.
 */
export const RequireAuth = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="spinner"></div>
        <p className="font-playfair text-gradient" style={{ marginTop: "1rem" }}>Verifying credentials...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // Redirect to suspended page if active user profile is suspended
  if (userProfile && userProfile.status === "suspended" && location.pathname !== "/admin/suspended") {
    return <Navigate to="/admin/suspended" replace />;
  }

  return children;
};

/**
 * Guard that requires users to be anonymous (not logged in).
 * Redirects logged in users to their respective dashboards.
 */
export const RequireAnon = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (currentUser && userProfile) {
    if (userProfile.status === "suspended") {
      return <Navigate to="/admin/suspended" replace />;
    }
    const targetDashboard = userProfile.role === "super_admin" 
      ? "/admin/super-dashboard" 
      : "/admin/dashboard";
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

/**
 * Guard that restricts route access by user roles.
 * Redirects unauthorized users back to their dashboard.
 */
export const RequireRole = ({ children, allowedRoles }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    const targetDashboard = userProfile?.role === "super_admin" 
      ? "/admin/super-dashboard" 
      : "/admin/dashboard";
    return <Navigate to={userProfile ? targetDashboard : "/admin"} replace />;
  }

  return children;
};

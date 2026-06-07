import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

const SuperDashboard = () => {
  const { userProfile } = useAuth();
  const { 
    activities, 
    projects, 
    articles, 
    team, 
    users, 
    activityLogs 
  } = useData();
  const navigate = useNavigate();

  // 1. Calculate General Stats
  const totalContentItems = activities.length + projects.length + articles.length + team.length;
  const totalAdmins = users.length;
  
  // Pending approvals across all 4 collections
  const pendingActivities = activities.filter(a => a.status === "pending").length;
  const pendingProjects = projects.filter(p => p.status === "pending").length;
  const pendingArticles = articles.filter(a => a.status === "pending").length;
  const pendingTeam = team.filter(t => t.status === "pending").length;
  const totalPendingApprovals = pendingActivities + pendingProjects + pendingArticles + pendingTeam;

  const totalAuditLogs = activityLogs.length;

  // Take the last 8 logs for preview
  const recentLogs = activityLogs.slice(0, 8);

  return (
    <div>
      {/* Welcome banner header */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 className="font-playfair" style={{ fontSize: "1.75rem", margin: "0 0 0.25rem 0", color: "var(--color-secondary)" }}>
          Super Admin Console, {userProfile?.fullName}!
        </h2>
        <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
          Central administrator panel for content approval, system audit, user accounts, and settings.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid-4" style={{ marginBottom: "var(--sp-10)" }}>
        <div className="admin-stat-card card">
          <div className="admin-stat-icon blue">📁</div>
          <div>
            <div className="admin-stat-value">{totalContentItems}</div>
            <div className="admin-stat-label">Total Items</div>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon orange">👥</div>
          <div>
            <div className="admin-stat-value">{totalAdmins}</div>
            <div className="admin-stat-label">Admin Users</div>
          </div>
        </div>

        <div className="admin-stat-card card" style={{ borderLeft: totalPendingApprovals > 0 ? "3px solid var(--color-primary)" : "none" }}>
          <div className="admin-stat-icon green" style={{ color: totalPendingApprovals > 0 ? "var(--color-primary)" : "#16a34a" }}>🔔</div>
          <div>
            <div className="admin-stat-value">{totalPendingApprovals}</div>
            <div className="admin-stat-label">Pending Approvals</div>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon purple">📜</div>
          <div>
            <div className="admin-stat-value">{totalAuditLogs}</div>
            <div className="admin-stat-label">Audit Logs</div>
          </div>
        </div>
      </div>

      {/* Main split: Quick Actions and Recent Logs */}
      <div className="grid-2" style={{ gap: "var(--sp-8)", alignItems: "start" }}>
        
        {/* Quick Links Column */}
        <div className="card" style={{ padding: "var(--sp-8)" }}>
          <h3 className="font-playfair" style={{ fontSize: "1.35rem", color: "var(--color-secondary)", marginBottom: "var(--sp-6)" }}>
            Quick Admin Tools
          </h3>
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "1rem" 
            }}
          >
            <Link 
              to="/admin/approval-center" 
              className="card text-center" 
              style={{ 
                padding: "var(--sp-6)", 
                textDecoration: "none", 
                backgroundColor: "var(--color-bg-alt)",
                border: totalPendingApprovals > 0 ? "1px solid var(--color-primary-light)" : "1px solid var(--color-border)"
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>🗳️</div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "var(--text-sm)" }}>Approval Queue</h4>
              <span className="badge badge-primary">{totalPendingApprovals} Items</span>
            </Link>

            <Link 
              to="/admin/management" 
              className="card text-center" 
              style={{ padding: "var(--sp-6)", textDecoration: "none", backgroundColor: "var(--color-bg-alt)" }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>👥</div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "var(--text-sm)" }}>Manage Admins</h4>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)" }}>{totalAdmins} Registered</span>
            </Link>

            <Link 
              to="/admin/audit-logs" 
              className="card text-center" 
              style={{ padding: "var(--sp-6)", textDecoration: "none", backgroundColor: "var(--color-bg-alt)" }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>📜</div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "var(--text-sm)" }}>Audit Trails</h4>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)" }}>{totalAuditLogs} Records</span>
            </Link>

            <Link 
              to="/admin/settings" 
              className="card text-center" 
              style={{ padding: "var(--sp-6)", textDecoration: "none", backgroundColor: "var(--color-bg-alt)" }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>⚙️</div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "var(--text-sm)" }}>System Settings</h4>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)" }}>Maintenance / Coming Soon</span>
            </Link>
          </div>
        </div>

        {/* Audit Logs Summary Column */}
        <div className="card" style={{ padding: "var(--sp-8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-6)" }}>
            <h3 className="font-playfair" style={{ fontSize: "1.35rem", color: "var(--color-secondary)", margin: 0 }}>
              Recent Audit Log
            </h3>
            <Link to="/admin/audit-logs" style={{ fontSize: "var(--text-xs)", color: "var(--color-primary)", fontWeight: "600", textDecoration: "none" }}>
              View All Logs
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentLogs.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                No audit log entries recorded.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div 
                  key={log.id} 
                  style={{ 
                    padding: "0.5rem 0.75rem", 
                    backgroundColor: "var(--color-bg-alt)", 
                    borderRadius: "var(--radius-sm)",
                    borderLeft: "3px solid var(--color-secondary-light)",
                    fontSize: "var(--text-xs)" 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", marginBottom: "2px" }}>
                    <span>{log.userName}</span>
                    <span style={{ color: "var(--color-text-light)" }}>
                      {new Date(log.timestamp?.seconds * 1000 || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: "var(--color-text-light)" }}>
                    {log.action} on <strong>{log.targetType}</strong>
                    {log.metadata?.title && ` (${log.metadata.title})`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperDashboard;

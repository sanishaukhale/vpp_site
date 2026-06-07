import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { userProfile } = useAuth();
  const { 
    activities, 
    projects, 
    articles, 
    team, 
    submitForApproval, 
    deleteContent 
  } = useData();
  const navigate = useNavigate();

  // 1. Calculate General Stats (counts of all approved content)
  const totalApprovedActivities = activities.filter(a => a.status === "approved").length;
  const totalApprovedProjects = projects.filter(p => p.status === "approved").length;
  const totalApprovedArticles = articles.filter(a => a.status === "approved").length;
  const totalApprovedTeam = team.filter(t => t.status === "approved").length;

  // 2. Fetch all content created by this logged-in admin user
  const myActivities = activities
    .filter(a => a.createdBy === userProfile?.uid)
    .map(a => ({ ...a, type: "Activity", collection: "activities", title: a.title }));
    
  const myProjects = projects
    .filter(p => p.createdBy === userProfile?.uid)
    .map(p => ({ ...p, type: "Project", collection: "projects", title: p.title }));
    
  const myArticles = articles
    .filter(a => a.createdBy === userProfile?.uid)
    .map(a => ({ ...a, type: "Article", collection: "articles", title: a.title }));
    
  const myTeam = team
    .filter(t => t.createdBy === userProfile?.uid)
    .map(t => ({ ...t, type: "Team", collection: "team", title: t.name }));

  // Combine into a single feed sorted by updatedAt/createdAt (newest first)
  const myContentFeed = [...myActivities, ...myProjects, ...myArticles, ...myTeam]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved": return { bg: "rgba(46, 204, 113, 0.15)", color: "#27ae60" };
      case "pending":  return { bg: "rgba(241, 196, 15, 0.15)", color: "#f39c12" };
      case "rejected": return { bg: "rgba(231, 76, 60, 0.15)", color: "#c0392b" };
      default:         return { bg: "rgba(127, 140, 141, 0.15)", color: "#7f8c8d" };
    }
  };

  const handleSubmit = async (colName, id) => {
    try {
      await submitForApproval(colName, id);
      toast.success("Submitted for approval!");
    } catch (error) {
      toast.error(error.message || "Failed to submit.");
    }
  };

  const handleDelete = async (colName, id) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      await deleteContent(colName, id);
      toast.success("Deleted draft successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to delete.");
    }
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 className="font-playfair" style={{ fontSize: "1.75rem", margin: "0 0 0.25rem 0", color: "var(--color-secondary)" }}>
          Welcome back, {userProfile?.fullName}!
        </h2>
        <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
          Here is an overview of the NGO portal status and your active submissions.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid-4" style={{ marginBottom: "var(--sp-10)" }}>
        <div className="admin-stat-card card">
          <div className="admin-stat-icon blue">🎓</div>
          <div>
            <div className="admin-stat-value">{totalApprovedActivities}</div>
            <div className="admin-stat-label">Activities Live</div>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon orange">💼</div>
          <div>
            <div className="admin-stat-value">{totalApprovedProjects}</div>
            <div className="admin-stat-label">Projects Live</div>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon green">📝</div>
          <div>
            <div className="admin-stat-value">{totalApprovedArticles}</div>
            <div className="admin-stat-label">Articles Live</div>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon purple">👥</div>
          <div>
            <div className="admin-stat-value">{totalApprovedTeam}</div>
            <div className="admin-stat-label">Team Members</div>
          </div>
        </div>
      </div>

      {/* Content Submissions Feed Table */}
      <div className="admin-table-wrap card">
        <div className="admin-table-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--sp-4)" }}>
          <h3 className="admin-table-title font-playfair">My Submissions & Drafts</h3>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)" }}>
            Showing {myContentFeed.length} entries
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          {myContentFeed.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              You haven't created any content yet. Go to content sections in the sidebar to add new entries.
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Title</th>
                  <th style={{ textAlign: "left" }}>Type</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Last Updated</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myContentFeed.map((item) => {
                  const style = getStatusStyle(item.status);
                  const showSubmit = item.status === "draft" || item.status === "rejected";
                  const showDelete = item.status === "draft" || item.status === "rejected";
                  
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: "600" }}>{item.title}</td>
                      <td>{item.type}</td>
                      <td>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                            padding: "0.2rem 0.6rem",
                            fontSize: "var(--text-xs)",
                            borderRadius: "var(--radius-sm)",
                            textTransform: "capitalize"
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)" }}>
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                            onClick={() => navigate(`/admin/${item.collection}?edit=${item.id}`)}
                          >
                            Edit
                          </button>
                          
                          {showSubmit && (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                              onClick={() => handleSubmit(item.collection, item.id)}
                            >
                              Submit
                            </button>
                          )}
                          
                          {showDelete && (
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", color: "var(--color-error)", borderColor: "var(--color-error-light)" }}
                              onClick={() => handleDelete(item.collection, item.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

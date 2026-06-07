import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import toast from "react-hot-toast";
import "./Admin.css";

const ApprovalCenter = () => {
  const { 
    activities, 
    projects, 
    articles, 
    team, 
    approveContent, 
    rejectContent 
  } = useData();

  const [expandedItemId, setExpandedItemId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  // 1. Compile all pending items across all 4 collections
  const pendingActivities = activities
    .filter((a) => a.status === "pending")
    .map((a) => ({ ...a, type: "Activity", collection: "activities" }));

  const pendingProjects = projects
    .filter((p) => p.status === "pending")
    .map((p) => ({ ...p, type: "Project", collection: "projects" }));

  const pendingArticles = articles
    .filter((a) => a.status === "pending")
    .map((a) => ({ ...a, type: "Article", collection: "articles" }));

  const pendingTeam = team
    .filter((t) => t.status === "pending")
    .map((t) => ({ ...t, type: "Team", collection: "team" }));

  const pendingItems = [
    ...pendingActivities,
    ...pendingProjects,
    ...pendingArticles,
    ...pendingTeam
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const handleApprove = async (col, id, title) => {
    try {
      await approveContent(col, id);
      toast.success(`Approved "${title}" successfully!`);
      setExpandedItemId(null);
    } catch (error) {
      toast.error(error.message || "Approval failed.");
    }
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectionReason("");
  };

  const handleRejectSubmit = async (col, id, title) => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    try {
      await rejectContent(col, id, rejectionReason);
      toast.success(`Rejected "${title}" and notified author.`);
      setRejectingId(null);
      setExpandedItemId(null);
    } catch (error) {
      toast.error(error.message || "Rejection failed.");
    }
  };

  // Helper to render diff comparison between original content and pending edits
  const renderDiff = (item) => {
    const changes = item.pendingChanges;

    // Case A: This is a completely new document submission
    if (!changes) {
      return (
        <div className="diff-box">
          <p style={{ fontWeight: "bold", color: "var(--color-primary-dark)", margin: "0 0 1rem 0" }}>
            New Document Submission Details:
          </p>
          <div className="diff-item" style={{ gridTemplateColumns: "1fr" }}>
            <div className="diff-label">Image</div>
            <div className="diff-pending" style={{ background: "none", border: "none", padding: 0 }}>
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt="submission" 
                  style={{ maxWidth: "200px", borderRadius: "var(--radius-md)" }} 
                />
              )}
            </div>

            <div className="diff-label">Title/Name</div>
            <div className="diff-pending">{item.title || item.name}</div>

            <div className="diff-label">Category</div>
            <div className="diff-pending">{item.category}</div>

            {item.status && item.type === "Project" && (
              <>
                <div className="diff-label">Project Status</div>
                <div className="diff-pending">{item.status}</div>
              </>
            )}

            {item.designation && (
              <>
                <div className="diff-label">Designation</div>
                <div className="diff-pending">{item.designation}</div>
              </>
            )}

            {item.description && (
              <>
                <div className="diff-label">Description / Bio</div>
                <div className="diff-pending" style={{ whiteSpace: "pre-wrap" }}>{item.description}</div>
              </>
            )}

            {item.body && (
              <>
                <div className="diff-label">Article Body</div>
                <div className="diff-pending" style={{ whiteSpace: "pre-wrap" }}>{item.body}</div>
              </>
            )}
          </div>
        </div>
      );
    }

    // Case B: This is an edit of an already approved document
    const changedKeys = Object.keys(changes).filter(
      (key) => JSON.stringify(item[key]) !== JSON.stringify(changes[key])
    );

    if (changedKeys.length === 0) {
      return <div className="diff-box">No modifications detected in pending changes.</div>;
    }

    return (
      <div className="diff-box">
        <p style={{ fontWeight: "bold", color: "var(--color-primary-dark)", margin: "0 0 1rem 0" }}>
          Modified Fields Comparison:
        </p>
        {changedKeys.map((key) => {
          const originalValue = item[key];
          const newValue = changes[key];

          return (
            <div key={key} className="diff-item" style={{ marginBottom: "1rem" }}>
              <div className="diff-label">{key}</div>
              
              {/* Image field has custom visual display */}
              {key === "imageUrl" ? (
                <>
                  <div className="diff-original">
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "bold" }}>Original Image:</p>
                    <img src={originalValue} alt="original" style={{ maxWidth: "120px", borderRadius: "var(--radius-sm)" }} />
                  </div>
                  <div className="diff-pending">
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "bold" }}>Staged Image:</p>
                    <img src={newValue} alt="staged" style={{ maxWidth: "120px", borderRadius: "var(--radius-sm)" }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="diff-original" style={{ whiteSpace: "pre-wrap" }}>
                    {originalValue || "(empty)"}
                  </div>
                  <div className="diff-pending" style={{ whiteSpace: "pre-wrap" }}>
                    {newValue || "(empty)"}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 className="font-playfair" style={{ fontSize: "1.75rem", margin: "0 0 0.25rem 0", color: "var(--color-secondary)" }}>
          Approval Center
        </h2>
        <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
          Review pending additions and edits created by volunteer admins before they go live on the public site.
        </p>
      </div>

      <div className="admin-table-wrap card">
        <div className="admin-table-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--sp-4)" }}>
          <h3 className="admin-table-title font-playfair">Pending Items Queue</h3>
          <span className="badge badge-primary">{pendingItems.length} Pending</span>
        </div>

        {pendingItems.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-muted)" }}>
            🎉 Excellent! The queue is completely empty. There are no pending approvals.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            {pendingItems.map((item) => {
              const isExpanded = expandedItemId === item.id;
              const isRejecting = rejectingId === item.id;
              const titleText = item.title || item.name;

              return (
                <div 
                  key={item.id} 
                  className="card" 
                  style={{ 
                    border: isExpanded ? "1px solid var(--color-primary)" : "1px solid var(--color-border-light)",
                    overflow: "hidden" 
                  }}
                >
                  {/* Summary Bar */}
                  <div 
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    style={{ 
                      padding: "1rem 1.5rem", 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      cursor: "pointer",
                      backgroundColor: isExpanded ? "var(--color-bg-alt)" : "transparent"
                    }}
                  >
                    <div>
                      <span 
                        className="badge" 
                        style={{ 
                          marginRight: "1rem",
                          backgroundColor: "rgba(255, 153, 51, 0.15)",
                          color: "var(--color-primary-dark)" 
                        }}
                      >
                        {item.type}
                      </span>
                      <strong style={{ fontSize: "1.05rem" }}>{titleText}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-light)", marginTop: "4px" }}>
                        Submitted by: <strong>{item.createdByName}</strong> • {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ fontWeight: "bold", color: "var(--color-primary)" }}>
                      {isExpanded ? "Collapse ▲" : "Review Details ▼"}
                    </div>
                  </div>

                  {/* Expanded Content and Diff area */}
                  {isExpanded && (
                    <div style={{ padding: "1.5rem", borderTop: "1px solid var(--color-border-light)", backgroundColor: "#fff" }}>
                      
                      {renderDiff(item)}

                      {/* Reject Form dialog block inside card */}
                      {isRejecting && (
                        <div 
                          style={{ 
                            marginTop: "1.5rem", 
                            padding: "1rem", 
                            border: "1px solid var(--color-error-light)", 
                            backgroundColor: "rgba(231,76,60,0.02)", 
                            borderRadius: "var(--radius-md)" 
                          }}
                        >
                          <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.5rem", color: "var(--color-error)" }}>
                            Rejection Reason
                          </label>
                          <textarea
                            rows="2"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please explain why this content is being rejected (the author will be notified)..."
                            style={{
                              width: "100%",
                              padding: "0.5rem",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--color-border)",
                              outline: "none",
                              fontSize: "var(--text-sm)",
                              resize: "none"
                            }}
                          />
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", justifyContent: "flex-end" }}>
                            <button 
                              className="btn btn-outline" 
                              onClick={() => setRejectingId(null)}
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleRejectSubmit(item.collection, item.id, titleText)}
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", backgroundColor: "var(--color-error)", borderColor: "var(--color-error)" }}
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Main buttons action row */}
                      {!isRejecting && (
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleRejectClick(item.id)}
                            style={{ color: "var(--color-error)", borderColor: "var(--color-error-light)" }}
                          >
                            Reject
                          </button>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleApprove(item.collection, item.id, titleText)}
                          >
                            Approve & Publish Live
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalCenter;

import React, { useState } from "react";
import { useData } from "../../context/DataContext";

const AuditLogs = () => {
  const { activityLogs } = useData();
  const [filterAction, setFilterAction] = useState("All");

  // Get unique actions for filter dropdown
  const uniqueActions = ["All", ...new Set(activityLogs.map((log) => log.action))];

  // Apply filter
  const filteredLogs = filterAction === "All"
    ? activityLogs
    : activityLogs.filter((log) => log.action === filterAction);

  return (
    <div>
      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-8)", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="font-playfair" style={{ fontSize: "1.75rem", margin: "0 0 0.25rem 0", color: "var(--color-secondary)" }}>
            System Audit Logs
          </h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
            Immutable logs of all administrative actions, logins, and settings updates.
          </p>
        </div>

        {/* Action Filter */}
        <div>
          <label style={{ fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", display: "inline-block", marginRight: "0.5rem" }}>Filter Action:</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{
              padding: "0.4rem 1.5rem 0.4rem 0.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: "var(--text-sm)",
              outline: "none"
            }}
          >
            {uniqueActions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="admin-table-wrap card">
        <div className="admin-table-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--sp-4)" }}>
          <h3 className="admin-table-title font-playfair">Audit History</h3>
          <span className="badge badge-secondary">{filteredLogs.length} Records</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          {filteredLogs.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              No audit logs found.
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Timestamp</th>
                  <th style={{ textAlign: "left" }}>User</th>
                  <th style={{ textAlign: "left" }}>Action</th>
                  <th style={{ textAlign: "left" }}>Target Type</th>
                  <th style={{ textAlign: "left" }}>Target ID</th>
                  <th style={{ textAlign: "left" }}>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const logDate = log.timestamp?.seconds
                    ? new Date(log.timestamp.seconds * 1000)
                    : new Date(log.timestamp);
                  
                  const formattedTime = logDate.toLocaleString();

                  return (
                    <tr key={log.id} style={{ fontSize: "0.85rem" }}>
                      <td style={{ color: "var(--color-text-light)", whiteSpace: "nowrap" }}>
                        {formattedTime}
                      </td>
                      <td>
                        <strong>{log.userName}</strong>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-light)" }}>{log.userEmail}</div>
                      </td>
                      <td>
                        <span 
                          style={{
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            color: log.action?.includes("DELETE") || log.action?.includes("REJECT") ? "var(--color-error)" : "var(--color-secondary-dark)"
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{log.targetType}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-text-light)" }}>
                        {log.targetId}
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {JSON.stringify(log.metadata)}
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

export default AuditLogs;

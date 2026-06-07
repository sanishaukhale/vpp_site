import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const adminSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const AdminManagement = () => {
  const { registerAdmin, sendPasswordReset } = useAuth();
  const { users, toggleUserStatus, deleteUser } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(adminSchema)
  });

  const onAddAdmin = async (data) => {
    setSubmitting(true);
    try {
      await registerAdmin(data.email, data.password, data.fullName);
      toast.success("Successfully registered new administrator! Account is suspended until active toggle.");
      reset();
      setShowAddForm(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to register new admin user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (uid, currentStatus) => {
    try {
      await toggleUserStatus(uid, currentStatus);
      toast.success(`User status updated successfully!`);
    } catch (error) {
      toast.error(error.message || "Failed to update status.");
    }
  };

  const handleDelete = async (uid, email, role) => {
    if (role === "super_admin") {
      toast.error("Super Admin accounts cannot be deleted directly.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete administrator account: ${email}?`)) return;

    try {
      await deleteUser(uid, email);
      toast.success("Account deleted from database.");
    } catch (error) {
      toast.error(error.message || "Failed to delete user.");
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordReset(email);
      toast.success(`Password reset email sent to ${email}!`);
    } catch (error) {
      toast.error(error.message || "Failed to trigger password reset.");
    }
  };

  return (
    <div>
      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-8)", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="font-playfair" style={{ fontSize: "1.75rem", margin: "0 0 0.25rem 0", color: "var(--color-secondary)" }}>
            Admin User Management
          </h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
            Invite new administrators, reset passwords, suspend, or delete volunteer accounts.
          </p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Close Form" : "+ Add New Admin"}
        </button>
      </div>

      {/* Add Admin Form Block */}
      {showAddForm && (
        <div className="card" style={{ padding: "var(--sp-8)", marginBottom: "var(--sp-8)", borderTop: "4px solid var(--color-primary)" }}>
          <h3 className="font-playfair" style={{ fontSize: "1.25rem", color: "var(--color-secondary)", marginBottom: "var(--sp-6)" }}>
            Invite Administrator Account
          </h3>
          
          <form onSubmit={handleSubmit(onAddAdmin)} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--sp-4)", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                Full Name
              </label>
              <input
                type="text"
                {...register("fullName")}
                placeholder="e.g. John Doe"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", outline: "none" }}
              />
              {errors.fullName && <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>{errors.fullName.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="e.g. john@vpp.org"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", outline: "none" }}
              />
              {errors.email && <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                Temporary Password
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="Min 6 characters"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", outline: "none" }}
              />
              {errors.password && <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>{errors.password.message}</p>}
            </div>

            <div>
              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.6rem" }}
              >
                {submitting ? "Inviting..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins Table */}
      <div className="admin-table-wrap card">
        <div className="admin-table-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--sp-4)" }}>
          <h3 className="admin-table-title font-playfair">Registered CMS Users</h3>
          <span className="badge badge-primary">{users.length} Users</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          {users.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              No users registered.
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Email</th>
                  <th style={{ textAlign: "left" }}>Role</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Last Active</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isActive = user.status === "active";
                  const isSuper = user.role === "super_admin";
                  const lastActiveDate = user.lastLogin 
                    ? new Date(user.lastLogin?.seconds * 1000 || user.lastLogin).toLocaleDateString()
                    : "Never";

                  return (
                    <tr key={user.uid}>
                      <td style={{ fontWeight: "600" }}>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: isSuper ? "rgba(37, 99, 235, 0.15)" : "rgba(108, 117, 125, 0.15)",
                            color: isSuper ? "#2563eb" : "#6c757d",
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.75rem",
                            borderRadius: "var(--radius-sm)"
                          }}
                        >
                          {isSuper ? "Super Admin" : "Volunteer Admin"}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: isActive ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)",
                            color: isActive ? "#27ae60" : "#c0392b",
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.75rem",
                            borderRadius: "var(--radius-sm)"
                          }}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)" }}>
                        {lastActiveDate}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          
                          {/* Toggle Active status */}
                          {!isSuper && (
                            <button
                              className="btn btn-outline"
                              style={{ 
                                padding: "0.25rem 0.5rem", 
                                fontSize: "0.75rem",
                                color: isActive ? "var(--color-error)" : "#27ae60",
                                borderColor: isActive ? "var(--color-error-light)" : "rgba(46, 204, 113, 0.3)"
                              }}
                              onClick={() => handleToggleStatus(user.uid, user.status)}
                            >
                              {isActive ? "Suspend" : "Activate"}
                            </button>
                          )}

                          {/* Reset Password */}
                          <button
                            className="btn btn-outline"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                            onClick={() => handlePasswordReset(user.email)}
                          >
                            Reset Pwd
                          </button>

                          {/* Delete Account */}
                          {!isSuper && (
                            <button
                              className="btn btn-outline"
                              style={{ 
                                padding: "0.25rem 0.5rem", 
                                fontSize: "0.75rem", 
                                color: "var(--color-error)", 
                                borderColor: "var(--color-error-light)" 
                              }}
                              onClick={() => handleDelete(user.uid, user.email, user.role)}
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

export default AdminManagement;

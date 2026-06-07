import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import ImageUploadWithCrop from "../../components/Admin/ImageUploadWithCrop";
import toast from "react-hot-toast";

const CATEGORIES = ["Education", "Healthcare", "Women Empowerment", "Rehabilitation", "Tribal Welfare", "Awareness"];
const STATUSES = ["Ongoing", "Completed"];

const ProjectsAdmin = () => {
  const { userProfile } = useAuth();
  const { 
    projects, 
    addContent, 
    updateContent, 
    deleteContent, 
    submitForApproval 
  } = useData();

  const [searchParams, setSearchParams] = useSearchParams();
  const editIdParam = searchParams.get("edit");

  // Filter and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [impact, setImpact] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (editIdParam) {
      const proj = projects.find(p => p.id === editIdParam);
      if (proj) {
        handleEditClick(proj);
      }
    }
  }, [editIdParam, projects]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setStatus(STATUSES[0]);
    setImageUrl("");
    setImpact("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (proj) => {
    const fields = proj.pendingChanges || proj;
    setTitle(fields.title || "");
    setDescription(fields.description || "");
    setCategory(fields.category || CATEGORIES[0]);
    setStatus(fields.status || STATUSES[0]);
    setImageUrl(fields.imageUrl || "");
    setImpact(fields.impact || "");
    
    setCurrentId(proj.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
    if (editIdParam) {
      setSearchParams({});
    }
  };

  const handleSave = async (submitDirectly = false) => {
    if (!title.trim() || !description.trim() || !imageUrl) {
      toast.error("Please fill in required fields and upload an image.");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = { 
        title, 
        description, 
        category, 
        status, 
        imageUrl, 
        impact: impact.trim() 
      };

      if (isEditing) {
        await updateContent("projects", currentId, payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("projects", currentId);
          toast.success("Changes submitted for approval!");
        } else {
          toast.success("Project updated successfully!");
        }
      } else {
        const newId = await addContent("projects", payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("projects", newId);
          toast.success("Project submitted for approval!");
        } else {
          toast.success(
            userProfile.role === "super_admin"
              ? "Project published live!"
              : "Project saved as draft!"
          );
        }
      }
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save project.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete project: "${title}"?`)) return;
    try {
      await deleteContent("projects", id);
      toast.success("Project deleted.");
    } catch (error) {
      toast.error(error.message || "Failed to delete.");
    }
  };

  const handleSubmit = async (id) => {
    try {
      await submitForApproval("projects", id);
      toast.success("Submitted for approval!");
    } catch (error) {
      toast.error(error.message || "Failed to submit.");
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || proj.status === filterStatus || proj.approvalStatus === filterStatus; // Checks both statuses
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (projStatus) => {
    const isOngoing = projStatus?.toLowerCase() === "ongoing";
    return {
      backgroundColor: isOngoing ? "rgba(255,153,51,0.12)" : "rgba(34,197,94,0.12)",
      color: isOngoing ? "var(--color-primary-dark)" : "#16a34a"
    };
  };

  const isSuper = userProfile?.role === "super_admin";

  return (
    <div>
      {/* Title block */}
      <div className="admin-action-bar">
        <div>
          <h2 className="font-playfair" style={{ fontSize: "1.75rem", color: "var(--color-secondary)", margin: "0 0 0.25rem 0" }}>
            Projects CMS
          </h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
            Manage strategic, long-term NGO initiatives and track their completed or ongoing status.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add New Project
        </button>
      </div>

      {/* Filter and search */}
      <div className="card" style={{ padding: "1rem", marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="admin-search" style={{ margin: 0, minWidth: "300px" }}>
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filter-bar">
            <label style={{ fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase" }}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ padding: "0.45rem 1.5rem 0.45rem 0.75rem", width: "auto" }}
            >
              <option value="All">All Projects</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="draft">Draft (Approval)</option>
              <option value="pending">Pending (Approval)</option>
              <option value="rejected">Rejected (Approval)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="admin-table-wrap card">
        <div style={{ overflowX: "auto" }}>
          {filteredProjects.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              No projects found.
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th style={{ textAlign: "left" }}>Title</th>
                  <th style={{ textAlign: "left" }}>Category</th>
                  <th style={{ textAlign: "left" }}>Project Status</th>
                  <th style={{ textAlign: "left" }}>Approval Status</th>
                  <th style={{ textAlign: "left" }}>Author</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj) => {
                  const isAuthor = proj.createdBy === userProfile?.uid;
                  const canEdit = isSuper || isAuthor;
                  const canDelete = isSuper || (isAuthor && (proj.status === "draft" || proj.status === "rejected"));
                  const canSubmit = isAuthor && (proj.status === "draft" || proj.status === "rejected");
                  const badgeStyle = getStatusBadgeStyle(proj.status);

                  return (
                    <tr key={proj.id}>
                      <td>
                        <img 
                          src={proj.imageUrl} 
                          alt="thumbnail" 
                          className="admin-table-thumb" 
                        />
                      </td>
                      <td style={{ fontWeight: "600" }}>
                        {proj.title}
                        {proj.pendingChanges && (
                          <span className="badge badge-warning" style={{ fontSize: "0.65rem", marginLeft: "0.5rem" }}>
                            Edits Pending
                          </span>
                        )}
                      </td>
                      <td>{proj.category}</td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: badgeStyle.backgroundColor, 
                            color: badgeStyle.color,
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.75rem",
                            borderRadius: "var(--radius-sm)"
                          }}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={`badge ${
                            proj.status === "approved" ? "badge-success" : 
                            proj.status === "pending" ? "badge-warning" : 
                            proj.status === "rejected" ? "badge-error" : "badge-gray"
                          }`}
                        >
                          {proj.status === "approved" || proj.status === "pending" || proj.status === "rejected" 
                            ? proj.status 
                            : "approved" /* Default seeding fallback */}
                        </span>
                      </td>
                      <td style={{ fontSize: "var(--text-xs)" }}>{proj.createdByName}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {canEdit && (
                            <button 
                              className="admin-action-btn edit"
                              onClick={() => handleEditClick(proj)}
                            >
                              Edit
                            </button>
                          )}
                          {canSubmit && (
                            <button 
                              className="admin-action-btn"
                              style={{ color: "#f39c12", borderColor: "rgba(241,196,15,0.4)" }}
                              onClick={() => handleSubmit(proj.id)}
                            >
                              Submit
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="admin-action-btn delete"
                              onClick={() => handleDelete(proj.id, proj.title)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: "600px", width: "100%" }}>
            <div className="modal-header">
              <h3 className="modal-title font-playfair">
                {isEditing ? "Edit Project" : "Create Project"}
              </h3>
              <button className="modal-close" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Mobile Medical Unit Sattari"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  className="form-select" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Project Status *</label>
                <select 
                  className="form-select" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map(stat => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-textarea" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a full summary of project scope, timelines, goals..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Social Impact (Optional)</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: "80px" }}
                  value={impact} 
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="Describe number of beneficiaries reached, villages covered..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image *</label>
                {imageUrl && (
                  <div style={{ marginBottom: "1rem" }}>
                    <img 
                      src={imageUrl} 
                      alt="Banner Preview" 
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                    />
                  </div>
                )}
                <ImageUploadWithCrop 
                  onUploadComplete={(url) => setImageUrl(url)}
                  aspect={16 / 9}
                  folder="projects"
                />
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "1rem" }}>
              <button 
                className="btn btn-outline" 
                onClick={handleModalClose}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              
              {!isSuper && (
                <>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleSave(false)} 
                    disabled={formSubmitting}
                    style={{ color: "var(--color-primary)", borderColor: "var(--color-primary-light)" }}
                  >
                    Save Draft
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleSave(true)} 
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? "Saving..." : "Submit for Approval"}
                  </button>
                </>
              )}

              {isSuper && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleSave(true)} 
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Publishing..." : "Publish Live"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsAdmin;

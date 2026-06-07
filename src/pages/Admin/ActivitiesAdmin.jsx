import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import ImageUploadWithCrop from "../../components/Admin/ImageUploadWithCrop";
import toast from "react-hot-toast";

const CATEGORIES = ["Education", "Healthcare", "Women Empowerment", "Rehabilitation", "Tribal Welfare", "Awareness"];

const ActivitiesAdmin = () => {
  const { userProfile } = useAuth();
  const { 
    activities, 
    addContent, 
    updateContent, 
    deleteContent, 
    submitForApproval 
  } = useData();

  const [searchParams, setSearchParams] = useSearchParams();
  const editIdParam = searchParams.get("edit");

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal/Form states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Trigger edit modal from search query params (useful for redirects from dashboard)
  useEffect(() => {
    if (editIdParam) {
      const act = activities.find(a => a.id === editIdParam);
      if (act) {
        handleEditClick(act);
      }
    }
  }, [editIdParam, activities]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setCategory(CATEGORIES[0]);
    setImageUrl("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (act) => {
    // If Admin is editing an approved item, they stage edits in pendingChanges
    // Let's populate the form fields. If there are already pendingChanges, populate with them!
    const fields = act.pendingChanges || act;

    setTitle(fields.title || "");
    setDescription(fields.description || "");
    setDate(fields.date || "");
    setCategory(fields.category || CATEGORIES[0]);
    setImageUrl(fields.imageUrl || "");
    
    setCurrentId(act.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
    // Clear search params
    if (editIdParam) {
      setSearchParams({});
    }
  };

  const handleSave = async (submitDirectly = false) => {
    if (!title.trim() || !description.trim() || !date || !imageUrl) {
      toast.error("Please fill in all required fields and upload an image.");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = { title, description, date, category, imageUrl };
      
      if (isEditing) {
        await updateContent("activities", currentId, payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("activities", currentId);
          toast.success("Changes submitted for approval!");
        } else {
          toast.success("Activity updated successfully!");
        }
      } else {
        const newId = await addContent("activities", payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("activities", newId);
          toast.success("Activity created and submitted for approval!");
        } else {
          toast.success(
            userProfile.role === "super_admin" 
              ? "Activity published live!" 
              : "Activity saved as draft!"
          );
        }
      }
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save activity.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteContent("activities", id);
      toast.success("Activity deleted.");
    } catch (error) {
      toast.error(error.message || "Failed to delete.");
    }
  };

  const handleSubmit = async (id) => {
    try {
      await submitForApproval("activities", id);
      toast.success("Submitted for approval!");
    } catch (error) {
      toast.error(error.message || "Failed to submit.");
    }
  };

  // Filter & Search matching logic
  const filteredActivities = activities.filter((act) => {
    const matchesSearch = act.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || act.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved": return "badge-success";
      case "pending":  return "badge-warning";
      case "rejected": return "badge-error";
      default:         return "badge-gray";
    }
  };

  const isSuper = userProfile?.role === "super_admin";

  return (
    <div>
      {/* Action header bar */}
      <div className="admin-action-bar">
        <div>
          <h2 className="font-playfair" style={{ fontSize: "1.75rem", color: "var(--color-secondary)", margin: "0 0 0.25rem 0" }}>
            Activities CMS
          </h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
            Manage the list of social and educational camps published on the public website.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add New Activity
        </button>
      </div>

      {/* Filter and Search Box row */}
      <div className="card" style={{ padding: "1rem", marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="admin-search" style={{ margin: 0, minWidth: "300px" }}>
            <input 
              type="text" 
              placeholder="Search activities by title..." 
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
              <option value="All">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-table-wrap card">
        <div style={{ overflowX: "auto" }}>
          {filteredActivities.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              No activities found matching filters.
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th style={{ textAlign: "left" }}>Title</th>
                  <th style={{ textAlign: "left" }}>Category</th>
                  <th style={{ textAlign: "left" }}>Date</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Author</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => {
                  const isAuthor = act.createdBy === userProfile?.uid;
                  const canEdit = isSuper || isAuthor;
                  
                  // Admin can only delete drafts or rejected items
                  const canDelete = isSuper || (isAuthor && (act.status === "draft" || act.status === "rejected"));
                  
                  // Admin can submit drafts/rejected items for approval
                  const canSubmit = isAuthor && (act.status === "draft" || act.status === "rejected");

                  return (
                    <tr key={act.id}>
                      <td>
                        <img 
                          src={act.imageUrl} 
                          alt="thumbnail" 
                          className="admin-table-thumb" 
                        />
                      </td>
                      <td style={{ fontWeight: "600" }}>
                        {act.title}
                        {act.pendingChanges && (
                          <span className="badge badge-warning" style={{ fontSize: "0.65rem", marginLeft: "0.5rem" }}>
                            Edits Pending
                          </span>
                        )}
                      </td>
                      <td>{act.category}</td>
                      <td>{new Date(act.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeColor(act.status)}`}>
                          {act.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "var(--text-xs)" }}>{act.createdByName}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {canEdit && (
                            <button 
                              className="admin-action-btn edit"
                              onClick={() => handleEditClick(act)}
                            >
                              Edit
                            </button>
                          )}
                          {canSubmit && (
                            <button 
                              className="admin-action-btn"
                              style={{ color: "#f39c12", borderColor: "rgba(241,196,15,0.4)" }}
                              onClick={() => handleSubmit(act.id)}
                            >
                              Submit
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="admin-action-btn delete"
                              onClick={() => handleDelete(act.id, act.title)}
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

      {/* Edit/Add Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: "600px", width: "100%" }}>
            <div className="modal-header">
              <h3 className="modal-title font-playfair">
                {isEditing ? "Edit Activity" : "Create Activity"}
              </h3>
              <button className="modal-close" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="form-group">
                <label className="form-label">Activity Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Free Eye Checkup Camp"
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
                <label className="form-label">Date of Event *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-textarea" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activity, outreach, and impact in detail..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image Banner *</label>
                {imageUrl && (
                  <div style={{ marginBottom: "1rem" }}>
                    <img 
                      src={imageUrl} 
                      alt="Current Banner" 
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                    />
                  </div>
                )}
                <ImageUploadWithCrop 
                  onUploadComplete={(url) => setImageUrl(url)}
                  aspect={16 / 9}
                  folder="activities"
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

export default ActivitiesAdmin;

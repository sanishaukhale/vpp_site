import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import ImageUploadWithCrop from "../../components/Admin/ImageUploadWithCrop";
import toast from "react-hot-toast";

const CATEGORIES = ["Founders", "Core Team", "Members", "Volunteers"];

const TeamAdmin = () => {
  const { userProfile } = useAuth();
  const { 
    team, 
    addContent, 
    updateContent, 
    deleteContent, 
    submitForApproval 
  } = useData();

  const [searchParams, setSearchParams] = useSearchParams();
  const editIdParam = searchParams.get("edit");

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [bio, setBio] = useState("");
  const [order, setOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (editIdParam) {
      const member = team.find(m => m.id === editIdParam);
      if (member) {
        handleEditClick(member);
      }
    }
  }, [editIdParam, team]);

  const resetForm = () => {
    setName("");
    setDesignation("");
    setCategory(CATEGORIES[0]);
    setBio("");
    setOrder(team.length + 1); // Default to last position
    setImageUrl("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (member) => {
    const fields = member.pendingChanges || member;
    setName(fields.name || "");
    setDesignation(fields.designation || "");
    setCategory(fields.category || CATEGORIES[0]);
    setBio(fields.bio || "");
    setOrder(fields.order || 0);
    setImageUrl(fields.imageUrl || "");
    
    setCurrentId(member.id);
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
    if (!name.trim() || !designation.trim() || !imageUrl) {
      toast.error("Please fill in name, designation and upload a portrait photo.");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = { 
        name, 
        designation, 
        category, 
        bio: bio.trim(), 
        order: parseInt(order, 10) || 0,
        imageUrl 
      };

      if (isEditing) {
        await updateContent("team", currentId, payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("team", currentId);
          toast.success("Changes submitted for approval!");
        } else {
          toast.success("Member profile updated successfully!");
        }
      } else {
        const newId = await addContent("team", payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("team", newId);
          toast.success("Member profile submitted for approval!");
        } else {
          toast.success(
            userProfile.role === "super_admin"
              ? "Member profile published live!"
              : "Member profile saved as draft!"
          );
        }
      }
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save team member.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete team member: "${name}"?`)) return;
    try {
      await deleteContent("team", id);
      toast.success("Member profile deleted.");
    } catch (error) {
      toast.error(error.message || "Failed to delete.");
    }
  };

  const handleSubmit = async (id) => {
    try {
      await submitForApproval("team", id);
      toast.success("Submitted for approval!");
    } catch (error) {
      toast.error(error.message || "Failed to submit.");
    }
  };

  // Sort and filter members: Sort by Category display rank then sorting order index
  const getCategoryRank = (cat) => CATEGORIES.indexOf(cat);

  const filteredTeam = team
    .filter((member) => {
      const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            member.designation?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" || member.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by category groupings first, then manual order field
      const catRankA = getCategoryRank(a.category);
      const catRankB = getCategoryRank(b.category);
      if (catRankA !== catRankB) return catRankA - catRankB;
      return (a.order || 0) - (b.order || 0);
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
      {/* Title Header */}
      <div className="admin-action-bar">
        <div>
          <h2 className="font-playfair" style={{ fontSize: "1.75rem", color: "var(--color-secondary)", margin: "0 0 0.25rem 0" }}>
            Team Directory CMS
          </h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
            Manage the list of founders, committee heads, general members, and coordinators.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add Team Member
        </button>
      </div>

      {/* Filter and search */}
      <div className="card" style={{ padding: "1rem", marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="admin-search" style={{ margin: 0, minWidth: "300px" }}>
            <input 
              type="text" 
              placeholder="Search team by name or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filter-bar">
            <label style={{ fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase" }}>Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select"
              style={{ padding: "0.45rem 1.5rem 0.45rem 0.75rem", width: "auto" }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="admin-table-wrap card">
        <div style={{ overflowX: "auto" }}>
          {filteredTeam.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              No team profiles found.
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Designation</th>
                  <th style={{ textAlign: "left" }}>Category</th>
                  <th style={{ textAlign: "left" }}>Sort Order</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Author</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeam.map((member) => {
                  const isAuthor = member.createdBy === userProfile?.uid;
                  const canEdit = isSuper || isAuthor;
                  const canDelete = isSuper || (isAuthor && (member.status === "draft" || member.status === "rejected"));
                  const canSubmit = isAuthor && (member.status === "draft" || member.status === "rejected");

                  return (
                    <tr key={member.id}>
                      <td>
                        <img 
                          src={member.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                          alt="member portrait" 
                          className="admin-table-thumb" 
                          style={{ borderRadius: "50%", width: "40px", height: "40px", objectFit: "cover" }}
                        />
                      </td>
                      <td style={{ fontWeight: "600" }}>
                        {member.name}
                        {member.pendingChanges && (
                          <span className="badge badge-warning" style={{ fontSize: "0.65rem", marginLeft: "0.5rem" }}>
                            Edits Pending
                          </span>
                        )}
                      </td>
                      <td>{member.designation}</td>
                      <td>
                        <span className="badge badge-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                          {member.category}
                        </span>
                      </td>
                      <td>
                        <strong>{member.order || 0}</strong>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "var(--text-xs)" }}>{member.createdByName}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {canEdit && (
                            <button 
                              className="admin-action-btn edit"
                              onClick={() => handleEditClick(member)}
                            >
                              Edit
                            </button>
                          )}
                          {canSubmit && (
                            <button 
                              className="admin-action-btn"
                              style={{ color: "#f39c12", borderColor: "rgba(241,196,15,0.4)" }}
                              onClick={() => handleSubmit(member.id)}
                            >
                              Submit
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="admin-action-btn delete"
                              onClick={() => handleDelete(member.id, member.name)}
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
                {isEditing ? "Edit Team Profile" : "Create Team Profile"}
              </h3>
              <button className="modal-close" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Dr. Ramesh Sawant"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={designation} 
                  onChange={(e) => setDesignation(e.target.value)} 
                  placeholder="e.g. President / Medical Officer"
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
                <label className="form-label">Sort Rank Position Index * (Lower numbers appear first on the page)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={order} 
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Biography (Optional)</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: "80px" }}
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a brief one or two sentences about this member..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Portrait Photo * (Square Crop)</label>
                {imageUrl && (
                  <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                    <img 
                      src={imageUrl} 
                      alt="Portrait Preview" 
                      style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }}
                    />
                  </div>
                )}
                <ImageUploadWithCrop 
                  onUploadComplete={(url) => setImageUrl(url)}
                  aspect={1} // Square aspect ratio
                  folder="team"
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

export default TeamAdmin;

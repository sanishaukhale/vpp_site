import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import ImageUploadWithCrop from "../../components/Admin/ImageUploadWithCrop";
import toast from "react-hot-toast";

const CATEGORIES = ["Education", "Healthcare", "Women Empowerment", "Rehabilitation", "Social Welfare", "Awareness"];

const ArticlesAdmin = () => {
  const { userProfile } = useAuth();
  const { 
    articles, 
    addContent, 
    updateContent, 
    deleteContent, 
    submitForApproval 
  } = useData();

  const [searchParams, setSearchParams] = useSearchParams();
  const editIdParam = searchParams.get("edit");

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (editIdParam) {
      const art = articles.find(a => a.id === editIdParam);
      if (art) {
        handleEditClick(art);
      }
    }
  }, [editIdParam, articles]);

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setBody("");
    setCategory(CATEGORIES[0]);
    setAuthor(userProfile?.fullName || "");
    setImageUrl("");
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (art) => {
    const fields = art.pendingChanges || art;
    setTitle(fields.title || "");
    setExcerpt(fields.excerpt || "");
    setBody(fields.body || "");
    setCategory(fields.category || CATEGORIES[0]);
    setAuthor(fields.author || "");
    setImageUrl(fields.imageUrl || "");
    
    setCurrentId(art.id);
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
    if (!title.trim() || !excerpt.trim() || !body.trim() || !imageUrl || !author.trim()) {
      toast.error("Please fill in all required fields and upload an image.");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = { 
        title, 
        excerpt, 
        body, 
        category, 
        author, 
        imageUrl,
        date: new Date().toISOString().split("T")[0] // Date of publish
      };

      if (isEditing) {
        await updateContent("articles", currentId, payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("articles", currentId);
          toast.success("Changes submitted for approval!");
        } else {
          toast.success("Article updated successfully!");
        }
      } else {
        const newId = await addContent("articles", payload);
        if (submitDirectly && userProfile.role !== "super_admin") {
          await submitForApproval("articles", newId);
          toast.success("Article submitted for approval!");
        } else {
          toast.success(
            userProfile.role === "super_admin"
              ? "Article published live!"
              : "Article saved as draft!"
          );
        }
      }
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save article.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete article: "${title}"?`)) return;
    try {
      await deleteContent("articles", id);
      toast.success("Article deleted.");
    } catch (error) {
      toast.error(error.message || "Failed to delete.");
    }
  };

  const handleSubmit = async (id) => {
    try {
      await submitForApproval("articles", id);
      toast.success("Submitted for approval!");
    } catch (error) {
      toast.error(error.message || "Failed to submit.");
    }
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.body?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || art.status === filterStatus;
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
      {/* Action header */}
      <div className="admin-action-bar">
        <div>
          <h2 className="font-playfair" style={{ fontSize: "1.75rem", color: "var(--color-secondary)", margin: "0 0 0.25rem 0" }}>
            Articles & Awareness CMS
          </h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
            Publish educational content, social studies, health advice, and general community blogs.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add New Article
        </button>
      </div>

      {/* Filter and search */}
      <div className="card" style={{ padding: "1rem", marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="admin-search" style={{ margin: 0, minWidth: "300px" }}>
            <input 
              type="text" 
              placeholder="Search articles by title..." 
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
          {filteredArticles.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              No articles found.
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th style={{ textAlign: "left" }}>Title</th>
                  <th style={{ textAlign: "left" }}>Category</th>
                  <th style={{ textAlign: "left" }}>Author</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Published Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => {
                  const isAuthor = art.createdBy === userProfile?.uid;
                  const canEdit = isSuper || isAuthor;
                  const canDelete = isSuper || (isAuthor && (art.status === "draft" || art.status === "rejected"));
                  const canSubmit = isAuthor && (art.status === "draft" || art.status === "rejected");

                  return (
                    <tr key={art.id}>
                      <td>
                        <img 
                          src={art.imageUrl} 
                          alt="thumbnail" 
                          className="admin-table-thumb" 
                        />
                      </td>
                      <td style={{ fontWeight: "600", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {art.title}
                        {art.pendingChanges && (
                          <span className="badge badge-warning" style={{ fontSize: "0.65rem", marginLeft: "0.5rem" }}>
                            Edits Pending
                          </span>
                        )}
                      </td>
                      <td>{art.category}</td>
                      <td>{art.author}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeColor(art.status)}`}>
                          {art.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "var(--text-xs)" }}>
                        {art.date ? new Date(art.date).toLocaleDateString() : "Draft"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {canEdit && (
                            <button 
                              className="admin-action-btn edit"
                              onClick={() => handleEditClick(art)}
                            >
                              Edit
                            </button>
                          )}
                          {canSubmit && (
                            <button 
                              className="admin-action-btn"
                              style={{ color: "#f39c12", borderColor: "rgba(241,196,15,0.4)" }}
                              onClick={() => handleSubmit(art.id)}
                            >
                              Submit
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="admin-action-btn delete"
                              onClick={() => handleDelete(art.id, art.title)}
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
          <div className="modal card" style={{ maxWidth: "650px", width: "100%" }}>
            <div className="modal-header">
              <h3 className="modal-title font-playfair">
                {isEditing ? "Edit Article" : "Create Article"}
              </h3>
              <button className="modal-close" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="form-group">
                <label className="form-label">Article Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Swami Vivekananda's Teachings on Community Service"
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
                <label className="form-label">Author Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)} 
                  placeholder="e.g. Dr. Ramesh Sawant"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teaser Excerpt * (Teaser summary shown in article grids)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={excerpt} 
                  onChange={(e) => setExcerpt(e.target.value)} 
                  placeholder="Summarize the article in one or two sentences..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Article Body *</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: "220px" }}
                  value={body} 
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the full body paragraph text..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Featured Image *</label>
                {imageUrl && (
                  <div style={{ marginBottom: "1rem" }}>
                    <img 
                      src={imageUrl} 
                      alt="Featured Preview" 
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                    />
                  </div>
                )}
                <ImageUploadWithCrop 
                  onUploadComplete={(url) => setImageUrl(url)}
                  aspect={16 / 9}
                  folder="articles"
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

export default ArticlesAdmin;

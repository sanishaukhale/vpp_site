import React from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { SITE_INFO } from "../constants/siteInfo";
import SEO from "../components/SEO";

const ProjectDetail = () => {
  const { id } = useParams();
  const { projects, loading } = useData();

  // Find project by ID
  const project = projects.find((proj) => proj.id === id);

  if (loading) {
    return (
      <div className="container" style={{ padding: "var(--sp-24) 0", textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto" }}></div>
        <p style={{ marginTop: "1rem" }}>Loading project details...</p>
      </div>
    );
  }

  if (!project || !project.isPublished) {
    return (
      <div className="container text-center" style={{ padding: "var(--sp-24) 0" }}>
        <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>⚠️</div>
        <h2 className="font-playfair" style={{ color: "var(--color-secondary)", marginBottom: "var(--sp-2)" }}>
          Project Not Found
        </h2>
        <p style={{ marginBottom: "var(--sp-6)", color: "var(--color-text-light)" }}>
          The project you are looking for does not exist or has not been published yet.
        </p>
        <Link to="/projects" className="btn btn-primary">Back to Projects</Link>
      </div>
    );
  }

  const { title, description, imageUrl, category, status, createdByName, impact } = project;
  const isOngoing = status?.toLowerCase() === "ongoing";

  return (
    <>
      <SEO 
        title={title} 
        description={description ? description.slice(0, 150) : ""} 
        keywords={`${category}, ${title}, ${SITE_INFO.shortName}`} 
        image={imageUrl}
        url={`/projects/${id}`}
      />

      {/* Hero Header */}
      <section className="page-hero">
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">{category}</span>
          <h1 className="font-playfair">{title}</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> <Link to="/projects">Projects</Link> <span style={{ margin: "0 0.5rem" }}>/</span> {title}
          </p>
        </div>
      </section>

      {/* Main Details and Description */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ gap: "var(--sp-12)", alignItems: "start" }}>
            {/* Left Content Column */}
            <div>
              <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap", marginBottom: "var(--sp-6)", paddingBottom: "var(--sp-4)", borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Project Status</span>
                  <p>
                    <span 
                      className={`badge`} 
                      style={{ 
                        backgroundColor: isOngoing ? "rgba(255, 153, 51, 0.15)" : "rgba(46, 204, 113, 0.15)",
                        color: isOngoing ? "var(--color-primary)" : "#2ecc71",
                        fontSize: "0.85rem",
                        padding: "0.2rem 0.6rem"
                      }}
                    >
                      {status}
                    </span>
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Category</span>
                  <p style={{ fontWeight: "600", fontSize: "var(--text-base)" }}>{category}</p>
                </div>
                {createdByName && (
                  <div>
                    <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Initiated By</span>
                    <p style={{ fontWeight: "600", fontSize: "var(--text-base)" }}>{createdByName}</p>
                  </div>
                )}
              </div>

              <div style={{ lineHeight: "1.8", color: "var(--color-text)", fontSize: "1.05rem", whiteSpace: "pre-line", marginBottom: "var(--sp-6)" }}>
                {description}
              </div>

              {/* Impact Section */}
              {impact && (
                <div style={{ marginTop: "var(--sp-8)", padding: "var(--sp-6)", backgroundColor: "var(--color-bg-alt)", borderLeft: "4px solid var(--color-primary)", borderRadius: "0 var(--radius-lg) var(--radius-lg) 0" }}>
                  <h3 className="font-playfair" style={{ fontSize: "1.25rem", color: "var(--color-secondary)", fontWeight: "700", marginBottom: "var(--sp-2)" }}>Project Impact</h3>
                  <p style={{ color: "var(--color-text-light)", lineHeight: "1.6" }}>{impact}</p>
                </div>
              )}

              <div style={{ marginTop: "var(--sp-8)" }}>
                <Link to="/projects" className="btn btn-outline">← Back to Projects</Link>
              </div>
            </div>

            {/* Photo Column */}
            <div style={{ position: "sticky", top: "calc(var(--navbar-height) + var(--sp-6))" }}>
              <img 
                src={imageUrl} 
                alt={title} 
                className="img-responsive"
                style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectDetail;

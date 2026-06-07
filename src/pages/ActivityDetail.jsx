import React from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { SITE_INFO } from "../constants/siteInfo";
import SEO from "../components/SEO";

const ActivityDetail = () => {
  const { id } = useParams();
  const { activities, loading } = useData();

  // Find the activity by ID
  const activity = activities.find((act) => act.id === id);

  if (loading) {
    return (
      <div className="container" style={{ padding: "var(--sp-24) 0", textAlgn: "center" }}>
        <div className="spinner" style={{ margin: "0 auto" }}></div>
        <p style={{ marginTop: "1rem" }}>Loading details...</p>
      </div>
    );
  }

  if (!activity || !activity.isPublished) {
    return (
      <div className="container text-center" style={{ padding: "var(--sp-24) 0" }}>
        <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>⚠️</div>
        <h2 className="font-playfair" style={{ color: "var(--color-secondary)", marginBottom: "var(--sp-2)" }}>
          Activity Not Found
        </h2>
        <p style={{ marginBottom: "var(--sp-6)", color: "var(--color-text-light)" }}>
          The activity you are looking for does not exist or has not been published yet.
        </p>
        <Link to="/activities" className="btn btn-primary">Back to Activities</Link>
      </div>
    );
  }

  const { title, description, imageUrl, category, date, createdByName } = activity;

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <>
      <SEO 
        title={title} 
        description={description ? description.slice(0, 150) : ""} 
        keywords={`${category}, ${title}, ${SITE_INFO.shortName}`} 
        image={imageUrl}
        url={`/activities/${id}`}
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
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> <Link to="/activities">Activities</Link> <span style={{ margin: "0 0.5rem" }}>/</span> {title}
          </p>
        </div>
      </section>

      {/* Main Content Details */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ gap: "var(--sp-12)", alignItems: "start" }}>
            {/* Description Text Column */}
            <div>
              <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap", marginBottom: "var(--sp-6)", paddingBottom: "var(--sp-4)", borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Date</span>
                  <p style={{ fontWeight: "600", fontSize: "var(--text-base)" }}>{formattedDate}</p>
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Category</span>
                  <p style={{ fontWeight: "600", fontSize: "var(--text-base)" }}>{category}</p>
                </div>
                {createdByName && (
                  <div>
                    <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Published By</span>
                    <p style={{ fontWeight: "600", fontSize: "var(--text-base)" }}>{createdByName}</p>
                  </div>
                )}
              </div>

              <div style={{ lineHeight: "1.8", color: "var(--color-text)", fontSize: "1.05rem", whiteSpace: "pre-line" }}>
                {description}
              </div>

              <div style={{ marginTop: "var(--sp-8)" }}>
                <Link to="/activities" className="btn btn-outline">← Back to Activities</Link>
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

export default ActivityDetail;

import React from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { SITE_INFO } from "../constants/siteInfo";
import SEO from "../components/SEO";

const ArticleDetail = () => {
  const { id } = useParams();
  const { articles, loading } = useData();

  // Find article by ID
  const article = articles.find((art) => art.id === id);

  if (loading) {
    return (
      <div className="container" style={{ padding: "var(--sp-24) 0", textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto" }}></div>
        <p style={{ marginTop: "1rem" }}>Loading article...</p>
      </div>
    );
  }

  if (!article || !article.isPublished) {
    return (
      <div className="container text-center" style={{ padding: "var(--sp-24) 0" }}>
        <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>⚠️</div>
        <h2 className="font-playfair" style={{ color: "var(--color-secondary)", marginBottom: "var(--sp-2)" }}>
          Article Not Found
        </h2>
        <p style={{ marginBottom: "var(--sp-6)", color: "var(--color-text-light)" }}>
          The article you are looking for does not exist or has not been published yet.
        </p>
        <Link to="/articles" className="btn btn-primary">Back to Articles</Link>
      </div>
    );
  }

  const { title, body, imageUrl, category, date, author } = article;

  // Format date
  const formattedDate = new Date(date || article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <>
      <SEO 
        title={title} 
        description={body ? body.slice(0, 150) : ""} 
        keywords={`${category}, ${title}, ${SITE_INFO.shortName}`} 
        image={imageUrl}
        url={`/articles/${id}`}
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
          <h1 className="font-playfair" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>{title}</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> <Link to="/articles">Articles</Link> <span style={{ margin: "0 0.5rem" }}>/</span> {title}
          </p>
        </div>
      </section>

      {/* Main post layout */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: "800px" }}>
          {/* Post Meta */}
          <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap", marginBottom: "var(--sp-8)", paddingBottom: "var(--sp-4)", borderBottom: "1px solid var(--color-border)" }}>
            <div>
              <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Published Date</span>
              <p style={{ fontWeight: "600" }}>{formattedDate}</p>
            </div>
            <div>
              <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Category</span>
              <p style={{ fontWeight: "600" }}>{category}</p>
            </div>
            {author && (
              <div>
                <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>Written By</span>
                <p style={{ fontWeight: "600" }}>{author}</p>
              </div>
            )}
          </div>

          {/* Post Image Banner */}
          <div style={{ marginBottom: "var(--sp-8)" }}>
            <img 
              src={imageUrl} 
              alt={title} 
              className="img-responsive"
              style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)" }}
            />
          </div>

          {/* Post Body Text */}
          <div style={{ lineHeight: "1.8", color: "var(--color-text)", fontSize: "1.1rem", whiteSpace: "pre-line" }}>
            {body}
          </div>

          {/* Back button */}
          <div style={{ marginTop: "var(--sp-12)", paddingTop: "var(--sp-6)", borderTop: "1px solid var(--color-border)" }}>
            <Link to="/articles" className="btn btn-outline">← Back to Articles</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ArticleDetail;

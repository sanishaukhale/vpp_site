import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";
import { SITE_INFO } from "../constants/siteInfo";
import { fadeInUp, staggerContainer } from "../constants/animations";
import SEO from "../components/SEO";

const Articles = () => {
  const { articles } = useData();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter approved and published articles, sort newest first
  const publishedArticles = articles
    .filter((art) => art.status === "approved" && art.isPublished)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Filter based on search query
  const filteredArticles = publishedArticles.filter((art) => {
    return (
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.body?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <SEO 
        title="Articles" 
        description={`Awareness and educational articles published by ${SITE_INFO.shortName}.`}
        keywords="articles, awareness, blog, education, social welfares, Goa"
      />

      {/* Page Hero Header */}
      <section className="page-hero">
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">Awareness</span>
          <h1 className="font-playfair">Articles & Blogs</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> Articles
          </p>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="section-bg-alt" style={{ padding: "var(--sp-6) 0", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--sp-4)" }}>
            <h2 className="font-playfair" style={{ fontSize: "1.25rem", margin: 0 }}>All Published Articles</h2>
            <div style={{ position: "relative", minWidth: "300px" }}>
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  fontSize: "var(--text-sm)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  outline: "none",
                  background: "var(--color-surface)"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid list */}
      <section className="section-padding">
        <div className="container">
          {filteredArticles.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--sp-16)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>🔍</div>
              <h3 className="font-playfair" style={{ fontSize: "1.5rem", color: "var(--color-secondary)", marginBottom: "var(--sp-2)" }}>
                No Articles Found
              </h3>
              <p style={{ color: "var(--color-text-light)" }}>
                We couldn't find any articles matching your search query.
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {filteredArticles.map((art) => {
                const formattedDate = new Date(art.date || art.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                });

                return (
                  <motion.div 
                    key={art.id} 
                    className="activity-card" 
                    variants={fadeInUp}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <div style={{ position: "relative" }}>
                      <img 
                        src={art.imageUrl} 
                        alt={art.title} 
                        className="activity-card-img" 
                        loading="lazy" 
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <span 
                        className="badge badge-primary"
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          zIndex: 2
                        }}
                      >
                        {art.category}
                      </span>
                    </div>
                    <div className="activity-card-body">
                      <div className="activity-card-meta">
                        <span className="activity-card-date">📅 {formattedDate}</span>
                        {art.author && (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginLeft: "var(--sp-2)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                            ✍️ {art.author}
                          </span>
                        )}
                      </div>
                      <h3 className="activity-card-title">{art.title}</h3>
                      <p className="activity-card-desc">{art.excerpt || art.body?.slice(0, 120) + "..."}</p>
                      <Link to={`/articles/${art.id}`} className="card-link">
                        Read Full Article <span className="arrow">→</span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default Articles;

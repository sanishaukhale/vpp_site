import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";
import { SITE_INFO } from "../constants/siteInfo";
import { fadeInUp, staggerContainer } from "../constants/animations";
import SEO from "../components/SEO";
import ActivityCard from "../components/ActivityCard";

const CATEGORIES = ["All", "Education", "Healthcare", "Women Empowerment", "Rehabilitation", "Tribal Welfare", "Awareness"];

const Activities = () => {
  const { activities } = useData();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter approved and published activities
  const publishedActivities = activities.filter(
    (act) => act.status === "approved" && act.isPublished
  );

  // Apply search query and category filters
  const filteredActivities = publishedActivities.filter((act) => {
    const matchesCategory = selectedCategory === "All" || act.category === selectedCategory;
    const matchesSearch = act.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEO 
        title="Activities" 
        description={`Outreach programs and activities of ${SITE_INFO.shortName}.`}
        keywords="activities, camps, healthcare, education, welfare, Goa"
      />

      {/* Page Hero Header */}
      <section className="page-hero">
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">Our Work</span>
          <h1 className="font-playfair">Activities & Programs</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> Activities
          </p>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section className="section-bg-alt" style={{ padding: "var(--sp-8) 0", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--sp-6)", flexWrap: "wrap" }}>
            {/* Category Buttons */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn ${selectedCategory === cat ? "btn-primary" : "btn-outline"}`}
                  style={{
                    padding: "0.4rem 1rem",
                    fontSize: "var(--text-xs)",
                    borderRadius: "var(--radius-full)"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Text Search Box */}
            <div style={{ position: "relative", minWidth: "250px" }}>
              <input
                type="text"
                placeholder="Search activities..."
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

      {/* Grid of Activities */}
      <section className="section-padding">
        <div className="container">
          {filteredActivities.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--sp-16)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>🔍</div>
              <h3 className="font-playfair" style={{ fontSize: "1.5rem", color: "var(--color-secondary)", marginBottom: "var(--sp-2)" }}>
                No Activities Found
              </h3>
              <p style={{ color: "var(--color-text-light)" }}>
                We couldn't find any activities matching your filters. Try checking other categories or keywords.
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
              {filteredActivities.map((act) => (
                <ActivityCard key={act.id} activity={act} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default Activities;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from "../constants/content";
import { SITE_INFO } from "../constants/siteInfo";
import { fadeInUp, staggerContainer } from "../constants/animations";
import SEO from "../components/SEO";
import ProjectCard from "../components/ProjectCard";

const Projects = () => {
  const { projects } = useData();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter approved and published projects
  const publishedProjects = projects.filter(
    (proj) => proj.status === "approved" && proj.isPublished
  );

  // Apply search query and dual filters
  const filteredProjects = publishedProjects.filter((proj) => {
    // Project status matches filter status (Ongoing vs Completed)
    // Note: proj.status is the actual project status ('Ongoing' or 'Completed'), whereas approval status is 'approved'
    // Let's check proj.status (e.g. 'Ongoing' / 'Completed')
    const matchesStatus = selectedStatus === "All" || proj.status === selectedStatus;
    const matchesCategory = selectedCategory === "All" || proj.category === selectedCategory;
    const matchesSearch = proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEO 
        title="Projects" 
        description={`Welfare and social projects undertaken by ${SITE_INFO.shortName}.`}
        keywords="projects, social society, healthcare, rehabilitation, education, Goa"
      />

      {/* Page Hero Header */}
      <section className="page-hero">
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">Our Initiatives</span>
          <h1 className="font-playfair">Key Projects</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> Projects
          </p>
        </div>
      </section>

      {/* Dual Filters & Search Bar */}
      <section className="section-bg-alt" style={{ padding: "var(--sp-8) 0", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--sp-6)", flexWrap: "wrap" }}>
            
            {/* Filter selectors & buttons */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              
              {/* Category Dropdown */}
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "0.25rem", color: "var(--color-text-light)" }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: "0.45rem 1.5rem 0.45rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: "var(--text-sm)",
                    outline: "none"
                  }}
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Selector Dropdown */}
              <div>
                <label style={{ fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "0.25rem", color: "var(--color-text-light)" }}>Project Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: "0.45rem 1.5rem 0.45rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: "var(--text-sm)",
                    outline: "none"
                  }}
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Keyword Search Input */}
            <div style={{ position: "relative", minWidth: "250px" }}>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "0.25rem", color: "var(--color-text-light)" }}>Search</label>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.45rem 1rem",
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

      {/* Grid of Project Cards */}
      <section className="section-padding">
        <div className="container">
          {filteredProjects.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--sp-16)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>🔍</div>
              <h3 className="font-playfair" style={{ fontSize: "1.5rem", color: "var(--color-secondary)", marginBottom: "var(--sp-2)" }}>
                No Projects Found
              </h3>
              <p style={{ color: "var(--color-text-light)" }}>
                We couldn't find any projects matching your selected status, category, or search query.
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
              {filteredProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default Projects;

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ABOUT_STORY, 
  ABOUT_VISION, 
  ABOUT_MISSION, 
  ABOUT_VALUES, 
  ABOUT_OBJECTIVES, 
  ABOUT_TIMELINE, 
  UNDERTAKEN_PROJECTS, 
  CURRENT_PROJECTS_LIST,
  EXPERT_LECTURERS
} from "../constants/content";
import { SITE_INFO } from "../constants/siteInfo";
import { fadeInUp, staggerContainer } from "../constants/animations";
import SEO from "../components/SEO";

const About = () => {
  return (
    <>
      <SEO 
        title="About Us" 
        description={`${SITE_INFO.shortName} - Our Story, Vision, and Mission.`}
        keywords="About, NGO, story, vision, mission, timeline, Goa"
      />

      {/* Page Hero Header */}
      <section className="page-hero">
        {/* Background image overlay */}
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">Who We Are</span>
          <h1 className="font-playfair">About Our Society</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> About
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ gap: "var(--sp-12)", alignItems: "center" }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge badge-primary mb-4">Our Legacy</span>
              <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>
                The Story of {SITE_INFO.shortName}
              </h2>
              {ABOUT_STORY.map((para, idx) => (
                <p key={idx} className="mb-6" style={{ lineHeight: "1.8", color: "var(--color-text-light)" }}>
                  {para}
                </p>
              ))}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ position: "relative" }}
            >
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80" 
                alt="Empowerment through education" 
                className="img-responsive"
                style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Side-by-Side */}
      <section className="section-padding section-bg-alt">
        <div className="container">
          <motion.div 
            className="grid-2" 
            style={{ gap: "var(--sp-8)" }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Vision Card */}
            <motion.div className="card" variants={fadeInUp} style={{ padding: "var(--sp-8)", borderTop: "4px solid var(--color-primary)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-4)" }}>👁️</div>
              <h3 className="font-playfair" style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "var(--sp-4)", color: "var(--color-secondary)" }}>
                Our Vision
              </h3>
              <p style={{ lineHeight: "1.7", color: "var(--color-text-light)" }}>
                {ABOUT_VISION}
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div className="card" variants={fadeInUp} style={{ padding: "var(--sp-8)", borderTop: "4px solid var(--color-secondary)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-4)" }}>🎯</div>
              <h3 className="font-playfair" style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "var(--sp-4)", color: "var(--color-secondary)" }}>
                Our Mission
              </h3>
              <ul style={{ paddingLeft: "1.25rem", color: "var(--color-text-light)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {ABOUT_MISSION.map((m, idx) => (
                  <li key={idx} style={{ lineHeight: "1.6" }}>{m}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values & Objectives Columns */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ gap: "var(--sp-12)" }}>
            {/* Core Values */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-playfair" style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "var(--sp-6)", color: "var(--color-secondary)" }}>
                Core Values
              </h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
                {ABOUT_VALUES.map((v, idx) => {
                  const parts = v.split(/ — | —|— |—/);
                  const title = parts[0];
                  const desc = parts.slice(1).join(" — ");
                  return (
                    <li key={idx} className="card" style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-4)", padding: "var(--sp-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ 
                        width: "32px", 
                        height: "32px", 
                        borderRadius: "50%", 
                        background: "rgba(255,153,51,0.1)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        color: "var(--color-primary)",
                        fontWeight: "bold",
                        flexShrink: 0,
                        fontSize: "0.85rem"
                      }}>
                        ✓
                      </div>
                      <div style={{ lineHeight: "1.6" }}>
                        <strong style={{ color: "var(--color-secondary)", fontSize: "var(--text-base)", display: "block", marginBottom: "2px" }}>{title}</strong>
                        <span style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)" }}>{desc}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Core Objectives */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-playfair" style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "var(--sp-6)", color: "var(--color-secondary)" }}>
                Our Objectives
              </h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                {ABOUT_OBJECTIVES.map((obj, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)", lineHeight: "1.6", color: "var(--color-text-light)" }}>
                    <div style={{ 
                      width: "8px", 
                      height: "8px", 
                      borderRadius: "50%", 
                      background: "var(--color-secondary)", 
                      marginTop: "9px",
                      flexShrink: 0 
                    }} />
                    <span style={{ fontSize: "var(--text-sm)" }}>{obj}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Milestones Vertical Timeline */}
      <section className="section-padding section-bg-alt">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="text-center" style={{ marginBottom: "var(--sp-12)" }}>
            <span className="badge badge-primary mb-3">Our History</span>
            <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>Key Milestones</h2>
          </div>

          <div className="timeline">
            {ABOUT_TIMELINE.map((mile, idx) => (
              <motion.div 
                key={idx} 
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="timeline-dot"></div>
                <span className="timeline-year">{mile.year}</span>
                <h3 className="timeline-title">{mile.title}</h3>
                <p className="timeline-content">{mile.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Showcase lists */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ gap: "var(--sp-10)" }}>
            {/* Current initiatives */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ padding: "var(--sp-8)" }}
            >
              <h3 className="font-playfair" style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "var(--sp-5)", color: "var(--color-secondary)" }}>
                Current Operations
              </h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                {CURRENT_PROJECTS_LIST.map((proj, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)", lineHeight: "1.6", color: "var(--color-text-light)" }}>
                    <span style={{ color: "var(--color-primary)", fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" }}>⚡</span>
                    <span>{proj}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Historical/Undertaken initiatives */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ padding: "var(--sp-8)" }}
            >
              <h3 className="font-playfair" style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "var(--sp-5)", color: "var(--color-secondary)" }}>
                Undertaken Projects
              </h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                {UNDERTAKEN_PROJECTS.map((proj, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)", lineHeight: "1.6", color: "var(--color-text-light)" }}>
                    <span style={{ color: "var(--color-secondary)", fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" }}>✓</span>
                    <span>{proj}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guest Lecturers Section */}
      <section className="section-padding section-bg-alt">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--sp-8)" }}>
            <span className="badge badge-secondary mb-3">Lectures & Guidance</span>
            <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>Expert Lecturers & Dignitaries</h2>
            <p style={{ color: "var(--color-text-light)", maxWidth: "600px", margin: "0 auto", lineHeight: "1.7" }}>
              To promote stress relief, respect for women, moral values, and healthy living, we regularly invite experts and dignitaries to guide our youth, teachers, and communities.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-4)", justifyContent: "center", marginTop: "var(--sp-8)" }}>
            {EXPERT_LECTURERS.map((expert, idx) => (
              <div key={idx} className="card" style={{ padding: "var(--sp-4) var(--sp-6)", borderRadius: "var(--radius-full)", background: "var(--color-surface)", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-sm)" }}>
                <span style={{ fontWeight: "600", color: "var(--color-secondary)", fontSize: "var(--text-sm)" }}>{expert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
};

export default About;

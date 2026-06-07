import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";
import { TEAM_CATEGORIES } from "../constants/content";
import { SITE_INFO } from "../constants/siteInfo";
import { fadeInUp, staggerContainer } from "../constants/animations";
import SEO from "../components/SEO";
import TeamCard from "../components/TeamCard";

const Team = () => {
  const { team } = useData();

  // Filter approved and published team members
  const publishedTeam = team.filter((member) => member.status === "approved" && member.isPublished);

  // Group team members by category and sort them by 'order'
  const getGroupMembers = (cat) => {
    return publishedTeam
      .filter((m) => m.category === cat)
      .sort((a, b) => (a.order || 99) - (b.order || 99));
  };

  return (
    <>
      <SEO 
        title="Our Team" 
        description={`Meet the founders, coordinators, and volunteers behind ${SITE_INFO.shortName}.`}
        keywords="team, founders, committee members, volunteers, Goa"
      />

      {/* Page Hero Header */}
      <section className="page-hero">
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">People Behind Society</span>
          <h1 className="font-playfair">Meet Our Team</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> Team
          </p>
        </div>
      </section>

      {/* Team Groups list */}
      <section className="section-padding">
        <div className="container">
          {TEAM_CATEGORIES.map((category) => {
            const members = getGroupMembers(category);
            if (members.length === 0) return null; // Hide categories with no members

            return (
              <div key={category} style={{ marginBottom: "var(--sp-16)" }}>
                {/* Category Title Header */}
                <div style={{ marginBottom: "var(--sp-8)", borderBottom: "2px solid var(--color-primary-light)", paddingBottom: "var(--sp-2)", display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
                  <h2 className="font-playfair" style={{ fontSize: "1.75rem", color: "var(--color-secondary)", margin: 0 }}>
                    {category}
                  </h2>
                  <span className="badge badge-primary">{members.length}</span>
                </div>

                {/* Team Card Grid */}
                <motion.div 
                  className="grid-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {members.map((member) => (
                    <TeamCard key={member.id} member={member} />
                  ))}
                </motion.div>
              </div>
            );
          })}

          {publishedTeam.length === 0 && (
            <div className="card text-center" style={{ padding: "var(--sp-16)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--sp-4)" }}>👥</div>
              <h3 className="font-playfair" style={{ fontSize: "1.5rem", color: "var(--color-secondary)", marginBottom: "var(--sp-2)" }}>
                No Team Members Found
              </h3>
              <p style={{ color: "var(--color-text-light)" }}>
                The team directory is currently empty.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Team;

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";
import { HOME_STATS, HOME_AWARDS, ABOUT_STORY } from "../constants/content";
import { SITE_INFO } from "../constants/siteInfo";
import { fadeInUp, staggerContainer, fadeIn } from "../constants/animations";
import SEO from "../components/SEO";
import AnimatedCounter from "../components/AnimatedCounter";
import ActivityCard from "../components/ActivityCard";

const Home = () => {
  const { activities } = useData();

  // Get 3 most recent approved/published activities
  const publishedActivities = activities
    .filter(act => act.status === "approved" && act.isPublished)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 3);

  return (
    <>
      <SEO 
        title="Home" 
        description={SITE_INFO.description} 
        keywords="NGO, education, rehabilitation, social welfare, Swami Vivekananda, Goa" 
      />

      {/* Hero Section */}
      <section className="section-hero">
        {/* Background image overlay */}
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25
          }}
        />
        <div className="container">
          <motion.div 
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            style={{ maxWidth: "800px" }}
          >
            <motion.span 
              className="badge badge-primary mb-6" 
              variants={fadeInUp}
              style={{ display: "inline-block", letterSpacing: "0.1em" }}
            >
              Changing Lives Since 2005
            </motion.span>
            
            <motion.h1 
              className="font-playfair text-gradient" 
              variants={fadeInUp}
              style={{ 
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)", 
                lineHeight: "1.1", 
                marginBottom: "var(--sp-6)",
                color: "#fff"
              }}
            >
              {SITE_INFO.tagline}
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              style={{ 
                fontSize: "var(--text-lg)", 
                color: "rgba(255,255,255,0.88)", 
                lineHeight: "1.6",
                marginBottom: "var(--sp-8)"
              }}
            >
              {SITE_INFO.name} is dedicated to creating a more inclusive and self-reliant society by supporting education, rehabilitation, and social welfare across Goa.
            </motion.p>

            <motion.div 
              className="hero-ctas" 
              variants={fadeInUp}
              style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap" }}
            >
              <Link to="/about" className="btn btn-primary btn-lg">Learn Our Story</Link>
              <Link to="/projects" className="btn btn-outline btn-lg" style={{ color: "#fff", borderColor: "#fff" }}>
                Our Projects
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats Counters */}
      <section className="section-padding section-bg-alt">
        <div className="container">
          <motion.div 
            className="grid-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {HOME_STATS.map((stat, idx) => (
              <motion.div 
                key={idx} 
                className="card text-center" 
                variants={fadeInUp}
                style={{ padding: "var(--sp-8)" }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "var(--sp-3)" }}>{stat.icon}</div>
                <div className="font-playfair" style={{ fontSize: "2.25rem", fontWeight: "700", color: "var(--color-secondary)", marginBottom: "var(--sp-1)" }}>
                  <AnimatedCounter value={stat.value} />
                </div>
                <div style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", fontWeight: "600" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ alignItems: "center", gap: "var(--sp-12)" }}>
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ position: "relative" }}
            >
              <img 
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" 
                alt="Swami Vivekananda philosophy" 
                className="img-responsive"
                style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)" }}
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge badge-secondary mb-4">Philosophy</span>
              <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>
                Inspired by Swami Vivekananda
              </h2>
              <blockquote style={{ borderLeft: "4px solid var(--color-primary)", paddingLeft: "1.5rem", fontStyle: "italic", fontSize: "1.1rem", margin: "1.5rem 0", color: "var(--color-text)" }}>
                "Arise, awake, and stop not till the goal is reached."
              </blockquote>
              <p className="mb-6" style={{ color: "var(--color-text-light)", lineHeight: "1.7" }}>
                {ABOUT_STORY[0]}
              </p>
              <Link to="/about" className="btn btn-secondary">Read Our Story</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Activities Section */}
      <section className="section-padding section-bg-alt">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--sp-4)", marginBottom: "var(--sp-10)" }}>
            <div>
              <span className="badge badge-primary mb-3">Outreach</span>
              <h2 className="font-playfair section-title" style={{ marginBottom: 0, color: "var(--color-secondary)" }}>Recent Activities</h2>
            </div>
            <Link to="/activities" className="btn btn-outline" style={{ display: "inline-block" }}>View All Activities</Link>
          </div>

          {publishedActivities.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--sp-12)" }}>
              <p>No recent activities found.</p>
            </div>
          ) : (
            <motion.div 
              className="grid-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {publishedActivities.map(act => (
                <ActivityCard key={act.id} activity={act} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Projects Section Removed */}

      {/* Awards & Recognition Section */}
      <section className="section-padding section-bg-alt">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--sp-12)" }}>
            <span className="badge badge-primary mb-3">Honors</span>
            <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>Awards & Recognition</h2>
          </div>
          <motion.div 
            className="grid-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {HOME_AWARDS.map((award, idx) => (
              <motion.div 
                key={idx} 
                className="card" 
                variants={fadeInUp}
                style={{ padding: "var(--sp-8)" }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "var(--sp-4)" }}>🏆</div>
                <h3 className="font-playfair" style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "var(--sp-3)" }}>
                  {award.title}
                </h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", lineHeight: "1.6" }}>
                  {award.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="section-padding text-center" style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))", color: "#fff" }}>
        <div className="container" style={{ maxWidth: "700px" }}>
          <h2 className="font-playfair" style={{ fontSize: "2.5rem", color: "#fff", marginBottom: "var(--sp-4)" }}>
            Together, We Can Empower Communities
          </h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "var(--sp-8)", opacity: 0.9 }}>
            Join our mission to provide rehabilitation, quality education, and support services to those in need across Goa. Volunteer your time or support our initiatives.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/contact" className="btn btn-secondary btn-lg" style={{ background: "#fff", color: "var(--color-primary)", border: "none" }}>
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

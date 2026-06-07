import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInUp } from "../constants/animations";

/**
 * Reusable Project Card Component
 * @param {Object} project - The project document
 */
const ProjectCard = ({ project }) => {
  const { id, title, description, imageUrl, category, status } = project;

  // Shorten description for preview
  const truncatedDesc = description && description.length > 120
    ? `${description.slice(0, 115)}...`
    : description;

  const isOngoing = status?.toLowerCase() === "ongoing";

  return (
    <motion.div 
      className="activity-card"
      variants={fadeInUp}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <div style={{ position: "relative" }}>
        <img src={imageUrl} alt={title} className="activity-card-img" loading="lazy" />
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2, display: "flex", gap: "0.5rem" }}>
          <span className="badge badge-primary">{category}</span>
          <span className={`badge ${isOngoing ? "badge-info" : "badge-gray"}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="activity-card-body">
        <h3 className="activity-card-title">{title}</h3>
        <p className="activity-card-desc">{truncatedDesc}</p>
        <Link to={`/projects/${id}`} className="card-link">
          View Project Details <span className="arrow">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectCard;

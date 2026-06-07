import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInUp } from "../constants/animations";

/**
 * Reusable Activity Card Component
 * @param {Object} activity - The activity document
 */
const ActivityCard = ({ activity }) => {
  const { id, title, description, imageUrl, category, date } = activity;

  // Format date nicely
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Shorten description for preview
  const truncatedDesc = description && description.length > 120
    ? `${description.slice(0, 115)}...`
    : description;

  return (
    <motion.div 
      className="activity-card"
      variants={fadeInUp}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <div style={{ position: "relative" }}>
        <img src={imageUrl} alt={title} className="activity-card-img" loading="lazy" />
        <span 
          className="badge badge-primary"
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 2
          }}
        >
          {category}
        </span>
      </div>
      <div className="activity-card-body">
        <div className="activity-card-meta">
          <span className="activity-card-date">📅 {formattedDate}</span>
        </div>
        <h3 className="activity-card-title">{title}</h3>
        <p className="activity-card-desc">{truncatedDesc}</p>
        <Link to={`/activities/${id}`} className="card-link">
          Read More <span className="arrow">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ActivityCard;

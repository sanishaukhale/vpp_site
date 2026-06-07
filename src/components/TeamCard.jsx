import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../constants/animations";

/**
 * Reusable Team Card Component
 * @param {Object} member - The team member document
 */
const TeamCard = ({ member }) => {
  const { name, designation, category, imageUrl, bio } = member;

  return (
    <motion.div 
      className="team-card"
      variants={fadeInUp}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name} 
          className="team-card-photo" 
          loading="lazy" 
        />
      ) : (
        <div className="team-card-photo-placeholder">👤</div>
      )}
      
      <div className="team-card-body">
        <div style={{ 
          display: "inline-block", 
          fontSize: "10px", 
          fontWeight: "700", 
          letterSpacing: "0.05em", 
          textTransform: "uppercase", 
          padding: "0.2rem 0.6rem", 
          borderRadius: "var(--radius-full)", 
          background: "var(--color-bg-alt)", 
          color: "var(--color-secondary)", 
          marginBottom: "var(--sp-2)", 
          border: "1px solid var(--color-border-light)" 
        }}>
          {category}
        </div>
        <h3 className="team-card-name">{name}</h3>
        <div className="team-card-role">{designation}</div>
        {bio && <p className="team-card-bio">{bio}</p>}
      </div>
    </motion.div>
  );
};

export default TeamCard;

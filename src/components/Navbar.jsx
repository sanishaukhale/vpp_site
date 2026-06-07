import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "../constants/navigation";
import { SITE_INFO } from "../constants/siteInfo";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Handle scroll trigger for blur/shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : "navbar-transparent"}`}>
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img 
              src="/logo.png" 
              alt="Swami Vivekananda Logo" 
              style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} 
            />
            <div className="navbar-logo-text">
              <span className="navbar-logo-name">{SITE_INFO.shortName}</span>
              <span className="navbar-logo-tagline">Society</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-links">
            {NAV_LINKS.map((link) => (
              <NavLink 
                key={link.path}
                to={link.path}
                className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
                end={link.path === "/"}
              >
                {link.label}
              </NavLink>
            ))}
            {/* CTA Removed */}
          </div>

          {/* Hamburger Menu Icon */}
          <button 
            className="navbar-hamburger" 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <span style={{ transform: isMobileOpen ? "rotate(45deg) translate(5px, 6deg)" : "none" }}></span>
            <span style={{ opacity: isMobileOpen ? 0 : 1 }}></span>
            <span style={{ transform: isMobileOpen ? "rotate(-45deg) translate(5px, -6deg)" : "none" }}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink 
                key={link.path}
                to={link.path}
                className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
                end={link.path === "/"}
              >
                {link.label}
              </NavLink>
            ))}
            {/* CTA Removed */}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

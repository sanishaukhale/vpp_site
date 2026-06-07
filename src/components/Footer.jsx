import React from "react";
import { Link } from "react-router-dom";
import { SITE_INFO } from "../constants/siteInfo";
import { NAV_LINKS } from "../constants/navigation";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img 
                src="/logo.png" 
                alt="Swami Vivekananda Logo" 
                style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} 
              />
              <span className="footer-logo-name">{SITE_INFO.name}</span>
            </Link>
            <p className="footer-tagline">
              {SITE_INFO.tagline}
            </p>
            <div className="footer-social">
              {SITE_INFO.social.facebook && (
                <a 
                  href={SITE_INFO.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-social-link"
                  aria-label="Facebook"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
              )}
              {SITE_INFO.social.instagram && (
                <a 
                  href={SITE_INFO.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-social-link"
                  aria-label="Instagram"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {SITE_INFO.social.youtube && (
                <a 
                  href={SITE_INFO.social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-social-link"
                  aria-label="YouTube"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.519 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.869.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Quick Links</h4>
            <div className="footer-links">
              {NAV_LINKS.map((link) => (
                <Link key={link.path} to={link.path} className="footer-link">
                  <span style={{ fontSize: "0.8em" }}>•</span> {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="footer-col-title">Contact Us</h4>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📍</span>
              <span>{SITE_INFO.address}</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">📞</span>
              <span>{SITE_INFO.phone}</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">✉️</span>
              <span>{SITE_INFO.email}</span>
            </div>
            {SITE_INFO.contacts && SITE_INFO.contacts.map((c, idx) => (
              <div key={idx} className="footer-contact-item" style={{ paddingLeft: "1.5rem", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>
                <span>👤 {c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {currentYear} {SITE_INFO.shortName}. All rights reserved.
          </div>
          <div className="footer-copyright">
            Inspiration: Swami Vivekananda
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

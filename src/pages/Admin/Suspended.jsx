import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Suspended = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
      navigate("/admin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "var(--color-bg-alt)", 
        padding: "1rem" 
      }}
    >
      <div 
        className="card text-center" 
        style={{ 
          maxWidth: "450px", 
          padding: "var(--sp-12)", 
          borderTop: "5px solid var(--color-error)",
          boxShadow: "var(--shadow-xl)" 
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "var(--sp-4)" }}>🚫</div>
        <h1 className="font-playfair" style={{ fontSize: "2rem", color: "var(--color-secondary)", marginBottom: "var(--sp-4)" }}>
          Account Suspended
        </h1>
        <p style={{ color: "var(--color-text-light)", lineHeight: "1.6", marginBottom: "var(--sp-8)", fontSize: "0.95rem" }}>
          Your administrative account is currently suspended. You cannot access the CMS dashboard or edit website content. If you believe this is in error, please reach out to the Super Admin.
        </p>

        <button 
          onClick={handleLogout} 
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.75rem", fontWeight: "600" }}
        >
          Sign Out & Return to Login
        </button>
      </div>
    </div>
  );
};

export default Suspended;

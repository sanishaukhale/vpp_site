import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { SITE_INFO } from "../../constants/siteInfo";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const Login = () => {
  const { login, sendPasswordReset, firebaseEnabled } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Successfully signed in!");
      // Navigation is handled by AuthGuards (RequireAnon redirects to dashboard)
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");
    if (!email || errors.email) {
      toast.error("Please enter a valid email address first to reset password.");
      return;
    }

    try {
      await sendPasswordReset(email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to trigger password reset.");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card card">
        <div className="admin-login-logo">
          <img 
            src="/logo.png" 
            alt="Swami Vivekananda Logo" 
            style={{ 
              margin: "0 auto var(--sp-4) auto", 
              width: "64px", 
              height: "64px", 
              borderRadius: "50%", 
              objectFit: "cover",
              display: "block"
            }}
          />
          <h2 className="font-playfair" style={{ fontSize: "1.75rem", color: "var(--color-secondary)", margin: "0 0 0.25rem 0" }}>
            {SITE_INFO.shortName} CMS
          </h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Admin Portal Control
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {/* Email input field */}
          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="e.g. admin@vpp.org"
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                outline: "none"
              }}
            />
            {errors.email && (
              <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label style={{ fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-primary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  padding: "0.6rem 2.5rem 0.6rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "var(--color-text-light)"
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.7rem",
              fontSize: "var(--text-sm)",
              fontWeight: "600",
              marginTop: "var(--sp-2)"
            }}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
          
          <div style={{ textAlign: "center", marginTop: "var(--sp-2)" }}>
            <Link to="/" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)", textDecoration: "none", fontWeight: "600" }}>
              ← Return to public website
            </Link>
          </div>
        </form>
        
        {!firebaseEnabled && (
          <div 
            style={{ 
              marginTop: "1.5rem", 
              padding: "0.5rem", 
              backgroundColor: "rgba(255,153,51,0.08)", 
              border: "1px dashed var(--color-primary)", 
              borderRadius: "var(--radius-md)", 
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              textAlign: "center"
            }}
          >
            <strong>Local Storage Fallback Mode</strong>
            <br />
            User: superadmin@vpp.org
            <br />
            Password: password (or any string)
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

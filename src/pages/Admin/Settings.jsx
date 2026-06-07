import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import toast from "react-hot-toast";

const Settings = () => {
  const { systemSettings, updateSystemSettings } = useData();
  const [updating, setUpdating] = useState(false);

  const handleToggleComingSoon = async () => {
    setUpdating(true);
    try {
      await updateSystemSettings({
        ...systemSettings,
        comingSoon: !systemSettings.comingSoon
      });
      toast.success(`Coming Soon Mode is now ${!systemSettings.comingSoon ? "ENABLED" : "DISABLED"}`);
    } catch (error) {
      toast.error(error.message || "Failed to update settings.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleMaintenance = async () => {
    setUpdating(true);
    try {
      await updateSystemSettings({
        ...systemSettings,
        maintenanceMode: !systemSettings.maintenanceMode
      });
      toast.success(`Maintenance Mode is now ${!systemSettings.maintenanceMode ? "ENABLED" : "DISABLED"}`);
    } catch (error) {
      toast.error(error.message || "Failed to update settings.");
    } finally {
      setUpdating(false);
    }
  };

  // Safe check for injected Vite definitions
  const appVersion = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0 (development)";
  
  const buildTime = typeof __BUILD_TIME__ !== "undefined" 
    ? new Date(__BUILD_TIME__).toLocaleString() 
    : new Date().toLocaleString();

  return (
    <div style={{ maxWidth: "600px" }}>
      {/* Title Header */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 className="font-playfair" style={{ fontSize: "1.75rem", margin: "0 0 0.25rem 0", color: "var(--color-secondary)" }}>
          System Settings
        </h2>
        <p style={{ color: "var(--color-text-light)", fontSize: "var(--text-sm)", margin: 0 }}>
          Manage global application states, maintenance overrides, and verify build metadata.
        </p>
      </div>

      {/* Settings Options Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
        
        {/* Toggle options card */}
        <div className="card" style={{ padding: "var(--sp-8)" }}>
          <h3 className="font-playfair" style={{ fontSize: "1.25rem", color: "var(--color-secondary)", marginBottom: "var(--sp-6)" }}>
            Application Overrides
          </h3>

          {/* Coming Soon row */}
          <div 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              paddingBottom: "var(--sp-4)", 
              borderBottom: "1px solid var(--color-border-light)",
              marginBottom: "var(--sp-4)" 
            }}
          >
            <div style={{ maxWidth: "75%" }}>
              <strong style={{ fontSize: "var(--text-sm)" }}>Coming Soon Screen</strong>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)", margin: "4px 0 0 0" }}>
                Enable to redirect all public visitors on the production domain to a coming soon announcement page. Admins can still access the CMS.
              </p>
            </div>
            <button 
              disabled={updating}
              onClick={handleToggleComingSoon}
              className={`btn ${systemSettings.comingSoon ? "btn-primary" : "btn-outline"}`}
              style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
            >
              {systemSettings.comingSoon ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Maintenance mode row */}
          <div style={{ display: "flex", justifySpace: "space-between", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ maxWidth: "75%" }}>
              <strong style={{ fontSize: "var(--text-sm)" }}>Maintenance Mode</strong>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-light)", margin: "4px 0 0 0" }}>
                Temporarily lock public frontend routes with a maintenance cover. Admins retain full CMS access.
              </p>
            </div>
            <button 
              disabled={updating}
              onClick={handleToggleMaintenance}
              className={`btn ${systemSettings.maintenanceMode ? "btn-primary" : "btn-outline"}`}
              style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
            >
              {systemSettings.maintenanceMode ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        {/* Build and version metadata card */}
        <div className="card" style={{ padding: "var(--sp-8)" }}>
          <h3 className="font-playfair" style={{ fontSize: "1.25rem", color: "var(--color-secondary)", marginBottom: "var(--sp-6)" }}>
            System Metadata
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", fontSize: "var(--text-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-light)" }}>CMS Application Version</span>
              <strong>v{appVersion}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-light)" }}>Vite Engine Mode</span>
              <strong>production (compiled)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-light)" }}>Latest Bundle Build Time</span>
              <strong>{buildTime}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;

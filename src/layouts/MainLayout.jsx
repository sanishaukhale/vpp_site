import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Public Layout Wrapper
 * Implements sticky footer and header margin offsets using Vanilla CSS
 */
const MainLayout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: "1 0 auto" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

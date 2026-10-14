// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop"; // Import here
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <ScrollToTop /> {/* Reset scroll position on route change */}
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
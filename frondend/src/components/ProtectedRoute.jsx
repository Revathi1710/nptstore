import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../store/authSlice";

// Not logged in  -> /login  (remembers the exact page, incl. ?flow=buynow)
// Logged in      -> renders the page
export default function ProtectedRoute({ children }) {
  const token = useSelector(selectToken);
  const location = useLocation();

  if (!token) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}
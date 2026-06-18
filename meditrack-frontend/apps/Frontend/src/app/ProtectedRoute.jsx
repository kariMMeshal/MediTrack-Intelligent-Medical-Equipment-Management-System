import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, AllowRole }) {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData) return <Navigate to="/login" />;

  const userRoles = userData?.roles || [];
  let isAllowed = false;

  if (AllowRole === "ROLE_ADMIN") {
    isAllowed = userRoles.includes("ROLE_ADMIN");
  } else if (AllowRole === "ROLE_USER") {
    isAllowed = userRoles.includes("ROLE_USER");
  } else if (AllowRole === "ROLE_BIOMED") {
    // Allowed if they have ROLE_BIOMED or any custom role (not Admin and not User)
    isAllowed = userRoles.some(
      (role) => role === "ROLE_BIOMED" || (role !== "ROLE_ADMIN" && role !== "ROLE_USER")
    );
  }

  if (!isAllowed) {
    console.warn("Access Denied: User does not have required role:", AllowRole);
    return <Navigate to="/main/dashboard/unauthorized" />;
  }
  return children;
}

export default ProtectedRoute;


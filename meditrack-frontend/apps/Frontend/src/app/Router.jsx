import { useState } from "react";
import { Route, Routes, Link, Navigate } from "react-router-dom";
import MainDashboard from "../components/layout/MainDashboard";
import ChatBot from "../features/chatbot/pages/ChatBot";
import Inbox from "../features/Inbox/pages/Inbox";
import Analysis from "../features/analysis/pages/Analysis";
import Reports from "../features/reports/pages/Reports";
import Inventory from "../features/inventory/pages/Inventory";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Signup from "../features/auth/pages/Signup";
import Login from "../features/auth/pages/Login";
import AdminRole from "../features/dashboard/pages/AdminRole";
import BiomedRole from "../features/dashboard/pages/BiomedRole";
import UserRole from "../features/dashboard/pages/UserRole";
import ProtectedRoute from "./ProtectedRoute";
import { getHighestRole, getDashboardPath } from "../utils/roleUtils";

import React from "react";
import Unauthorized from "../features/auth/pages/Unauthorized";

function Router() {
  const [info, setInfo] = useState({
    open: false,
    index: null,
  });

  let userData = null;
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      userData = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error("Failed to parse user data:", e);
    localStorage.removeItem("user");
  }

  const username = userData?.username || "Guest";

  return (
    <div>
      <Routes>
        <Route path="/main" element={<MainDashboard />}>
          <Route
            path="dashboard"
            element={<Dashboard info={info} setInfo={setInfo} />}
          >
            <Route
              index
              element={
                userData ? (
                  <Navigate
                    to={getDashboardPath(getHighestRole(userData.roles))}
                    replace
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="adminrole"
              element={
                <ProtectedRoute AllowRole="ROLE_ADMIN">
                  <AdminRole />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="biomedrole"
              element={
                <ProtectedRoute AllowRole="ROLE_BIOMED">
                  <BiomedRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="userrole"
              element={
                <ProtectedRoute AllowRole="ROLE_USER">
                  <UserRole />
                </ProtectedRoute>
              }
            />
            <Route path="unauthorized" element={<Unauthorized />} />
          </Route>
          <Route path="chatbot" element={<ChatBot username={username} />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="reports" element={<Reports />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default Router;

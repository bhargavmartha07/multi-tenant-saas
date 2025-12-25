import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import TenantAdminDashboard from "./pages/tenant-admin/Dashboard";
import UserDashboard from "./pages/user/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/super-admin"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tenant-admin"
          element={
            <ProtectedRoute roles={["tenant_admin"]}>
              <TenantAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute roles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

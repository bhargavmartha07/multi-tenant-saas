import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import AuthProvider from "./auth/AuthProvider";

import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import TenantAdminDashboard from "./pages/tenant-admin/Dashboard";
import Projects from "./pages/tenant-admin/Projects";
import Users from "./pages/tenant-admin/Users";
import UserDashboard from "./pages/user/Dashboard";
import AppLayout from "./components/AppLayout";
import ProjectDetails from "./pages/tenant-admin/ProjectDetails";
import TasksPage from "./pages/tenant-admin/TasksPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ✅ ROOT FIX */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/super-admin"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <AppLayout>
                  <SuperAdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant-admin"
            element={
              <ProtectedRoute roles={["tenant_admin"]}>
                <AppLayout>
                  <TenantAdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant-admin/projects"
            element={
              <ProtectedRoute roles={["tenant_admin"]}>
                <AppLayout>
                  <Projects />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant-admin/projects/:projectId"
            element={
              <ProtectedRoute roles={["tenant_admin"]}>
                <AppLayout>
                  <ProjectDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant-admin/users"
            element={
              <ProtectedRoute roles={["tenant_admin"]}>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant-admin/tasks"
            element={
              <ProtectedRoute roles={["tenant_admin"]}>
                <AppLayout>
                  <TasksPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute roles={["user"]}>
                <AppLayout>
                  <UserDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
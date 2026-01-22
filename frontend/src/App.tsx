// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";

import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardHome from "./pages/dashboard/Index";
import DashboardMedicines from "./pages/dashboard/Medicines";
import DashboardSettings from "./pages/dashboard/Settings";

import "./App.css";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>
          <Route path="/medicines" element={<DashboardLayout />}>
            <Route index element={<DashboardMedicines />} />
          </Route>
        </Route>

        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>

      <Toaster />
    </>
  );
}

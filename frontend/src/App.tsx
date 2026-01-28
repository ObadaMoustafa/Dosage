// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";

import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardHome from "./pages/dashboard/Index";
import DashboardMedicines from "./pages/dashboard/Medicines";
import DashboardSchedules from "./pages/dashboard/Schedules";
import DashboardSettings from "./pages/dashboard/Settings";
import DashboardHistory from "./pages/dashboard/History";
import DashboardVoorraad from "./pages/dashboard/Inventory.tsx";
import DashboardAdmin from "./pages/dashboard/Admin";

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
            <Route path="admin" element={<DashboardAdmin />} />
          </Route>
          <Route path="/medicines" element={<DashboardLayout />}>
            <Route index element={<DashboardMedicines />} />
          </Route>
          <Route path="/schedules" element={<DashboardLayout />}>
            <Route index element={<DashboardSchedules />} />
          </Route>
          <Route path="/history" element={<DashboardLayout />}>
            <Route index element={<DashboardHistory />} />
          </Route>
          <Route path="/dashboard/inventory" element={<DashboardLayout />}>
            <Route index element={<DashboardVoorraad />} />
          </Route>
        </Route>

        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>

      <Toaster />
    </>
  );
}

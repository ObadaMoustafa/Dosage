import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth.status === "loading") {
    return <div style={{ padding: 16 }}>Laden...</div>;
  }

  if (auth.status === "unauthed") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

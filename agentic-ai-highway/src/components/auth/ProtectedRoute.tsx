import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from "@/components/portal/Sidebar";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "admin" | "citizen";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const role = localStorage.getItem("userRole") as UserRole;
  const location = useLocation();

  if (!role) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== allowedRole) {
    // Redirect to their respective dashboard if they try to access the wrong area
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

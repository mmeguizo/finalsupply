import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// import { useSession } from "./SessionContext";
import { useSession } from "../auth/SessionContext";
import { ROUTE_ROLES } from "./config/role";
import { hasRouteAccess } from "./authUtils"; // Import the utility function

interface ProtectedRouteProps {
  routePath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  routePath,
}) => {
  const { session } = useSession();

  // Redirect to sign-in if no session exists
  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  const userRole = session.user?.role;
  
  // Use the hasRouteAccess utility function instead of inline logic
  if (!hasRouteAccess(userRole, routePath, ROUTE_ROLES)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};



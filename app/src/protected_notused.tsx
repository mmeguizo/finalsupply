import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "./SessionContext_notused";
import { ROUTE_ROLES } from "./config/role"; // Import ROUTE_ROLES as a named export

interface ProtectedRouteProps {
  routePath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  routePath,
}) => {
  const { session } = useSession();

  // console.log("Protected route check:", {
  //   routePath,
  //   session,
  //   allowedRoles: ROUTE_ROLES[routePath as keyof typeof ROUTE_ROLES] || [],
  //   userRole: session?.user?.role,
  // });

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  const allowedRoles = ROUTE_ROLES[routePath as keyof typeof ROUTE_ROLES] || [];
  const userRole = session.user?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    // console.log(`Access denied: ${userRole} cannot access ${routePath}`);
    return <Navigate to="/" replace />;
  }

  // console.log(`Access granted: ${userRole} can access ${routePath}`);
  return <Outlet />;
};

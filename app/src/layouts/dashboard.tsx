import { Outlet, Navigate, useLocation } from "react-router";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import React, { useContext } from "react";
import { useSession } from "../auth/SessionContext";

export default function Layout() {
  // const { session } = useSession();
  const location = useLocation();
  const { session, setSession } = useSession();

  if (!session) {
    // Add the `callbackUrl` search parameter
    // const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}

import * as React from 'react';
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { Outlet } from "react-router";
import { useAuth } from '../hooks/useAuth';
import { ROUTE_ROLES } from '../config/role';
import { filterNavigationByRole } from '../authUtils';
import { ALL_NAVIGATION } from '../../navigation/routes';
import { BRANDING } from '../../utils/branding';
import useSignatoryStore from '../../stores/signatoryStore';

export const AppContent = () => {
  const { session, signIn, signOut } = useAuth();
  
  const filteredNavigation = React.useMemo(
    () =>
      filterNavigationByRole(ALL_NAVIGATION, session?.user?.role, ROUTE_ROLES),
    [session]
  );

  const fetchSignatories = useSignatoryStore((state) => state.fetchSignatories);
  React.useEffect(() => {
     // This should only be called if user is authenticated and has proper role
     if (session?.user?.role === 'admin') {
      fetchSignatories();
    }
  }, [fetchSignatories]);

  return (
    <ReactRouterAppProvider
      navigation={filteredNavigation}
      branding={BRANDING}
      session={session}
      authentication={{ signIn, signOut }}
    >
      <Outlet />
    </ReactRouterAppProvider>
  );
};
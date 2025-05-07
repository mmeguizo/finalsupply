import * as React from "react";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { Outlet, useNavigate } from "react-router";
import { SessionProvider, useSession } from "./auth/SessionContext";
import { ROUTE_ROLES } from "./auth/config/role";
import { clearSession, filterNavigationByRole } from "./auth/authUtils";
import { ALL_NAVIGATION } from "./navigation/routes";
import { BRANDING } from "./utils/branding";
import useSignatoryStore from "./stores/signatoryStore";
import { useEffect } from "react";

const AppContent = () => {
  const { session, setSession } = useSession();
  const navigate = useNavigate();

  const signIn = React.useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  const signOut = React.useCallback(() => {
    setSession(null);
    clearSession();
    navigate("/sign-in");
  }, [navigate, setSession]);

  const filteredNavigation = React.useMemo(
    () =>
      filterNavigationByRole(ALL_NAVIGATION, session?.user?.role, ROUTE_ROLES),
    [session]
  );

  // Inside your component:
  const fetchSignatories = useSignatoryStore((state) => state.fetchSignatories);
  useEffect(() => {
    fetchSignatories();
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

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

//TODO clean up code in the future
// import * as React from "react";
// // import DashboardIcon from "@mui/icons-material/Dashboard";
// // @ts-ignore
// import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// import { ReactRouterAppProvider } from "@toolpad/core/react-router";
// import { Outlet, useNavigate } from "react-router";
// import type { Navigation, Session } from "@toolpad/core/AppProvider";
// // @ts-ignore
// import { SessionContext } from "./SessionContext";
// // @ts-ignore
// import AddBusinessIcon from "@mui/icons-material/AddBusiness";
// import { SessionsType } from "./types/genericTypes";
// import InventoryIcon from "@mui/icons-material/Inventory";
// // @ts-ignore
// import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
// import ShowChartIcon from "@mui/icons-material/ShowChart";
// import DrawIcon from '@mui/icons-material/Draw';
// // @ts-ignore
// import { ROUTE_ROLES } from "./config/role";
// // Original full navigation
// const ALL_NAVIGATION: Navigation = [
//   {
//     kind: "header",
//     title: "Main items",
//   },
//   {
//     title: "Dashboard",
//     icon: <DashboardCustomizeIcon />,
//   },
//   {
//     segment: "purchaseorder",
//     title: "Inspection Acceptance Report",
//     icon: <BusinessCenterIcon />,
//   },
//   {
//     segment: "inventory",
//     title: " Inventory",
//     icon: <ShowChartIcon />,
//   },
//   {
//     segment: "signatories",
//     title: "Signatories",
//     icon: <DrawIcon />,
//   },
//   {
//     segment: "tests",
//     title: "Test",
//     icon: <AddBusinessIcon />,
//   },
// ];

// const BRANDING = {
//   logo: (
//     <img src="../../logo.png" alt="CHMSU LOGO" style={{ height: "20vh" }} />
//   ),
//   title: "Supply",
// };

// export default function App() {
//   const storedSession = localStorage.getItem("session");

//   // const [session, setSession] = React.useState<Session | null>(null);
//   const [session, setSession] = React.useState<SessionsType | null>(
//     storedSession ? JSON.parse(storedSession) : null
//   );

//   const navigate = useNavigate();

//   const signIn = React.useCallback(() => {
//     navigate("/sign-in");
//   }, [navigate]);

//   const signOut = React.useCallback(() => {
//     setSession(null);
//     localStorage.removeItem("session"); // Clear session from storage
//     navigate("/sign-in");
//   }, [navigate]);

//   // Save session to localStorage whenever it changes
//   React.useEffect(() => {
//     if (session) {
//       localStorage.setItem("session", JSON.stringify(session));
//     }
//   }, [session]);

//   const sessionContextValue = React.useMemo(
//     () => ({ session, setSession }),
//     [session, setSession]
//   );
//   const filteredNavigation = React.useMemo(() => {
//     if (!session?.user?.role) return ALL_NAVIGATION;

//     return ALL_NAVIGATION.filter((item) => {
//       // Always keep headers
//       if (item.kind === "header") return true;

//       // If this item has a segment, check permissions
//       if ("segment" in item && item.segment) {
//         const allowedRoles =
//           ROUTE_ROLES[item.segment as keyof typeof ROUTE_ROLES] || [];
//         return allowedRoles.includes(session?.user?.role as any);
//       }

//       // Items without segments (like Dashboard) are shown
//       return true;
//     });
//   }, [session]);

//   return (
//     <SessionContext.Provider value={sessionContextValue}>
//       <ReactRouterAppProvider
//         navigation={filteredNavigation} // Use filtered navigation instead of ALL_NAVIGATION
//         branding={BRANDING}
//         session={session}
//         authentication={{ signIn, signOut }}
//       >
//         <Outlet />
//       </ReactRouterAppProvider>
//     </SessionContext.Provider>
//   );
// }

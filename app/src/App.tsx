import * as React from "react";
// import DashboardIcon from "@mui/icons-material/Dashboard";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { Outlet, useNavigate } from "react-router";
import type { Navigation, Session } from "@toolpad/core/AppProvider";
import { SessionContext } from "./SessionContext";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { SessionsType } from "./types/genericTypes";
import InventoryIcon from "@mui/icons-material/Inventory";
import PurchaseOrder from "./pages/purchaseorder";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ShowChartIcon from "@mui/icons-material/ShowChart";
// Original full navigation
const ALL_NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    title: "Dashboard",
    icon: <DashboardCustomizeIcon />,
  },
  {
    segment: "purchaseorder",
    title: "Inspection Acceptance Report",
    icon: <BusinessCenterIcon />,
  },
  {
    segment: "inventory",
    title: " Inventory",
    icon: <ShowChartIcon />,
  },
  {
    segment: "orders",
    title: " Orders",
    icon: <InventoryIcon />,
  },
  {
    segment: "tests",
    title: "Test",
    icon: <AddBusinessIcon />,
  },
];

// Separate route-to-role mapping
export const ROUTE_ROLES = {
  "": ["admin", "user"], // Dashboard (default route)
  orders: ["admin"],
  purchaseorder: ["admin"],
  inventory: ["user", "admin"],
  tests: ["user", "admin"],
};

const BRANDING = {
  logo: (
    <img src="../../logo.png" alt="CHMSU LOGO" style={{ height: "20vh" }} />
  ),
  title: "Supply",
};

export default function App() {
  const storedSession = localStorage.getItem("session");

  // const [session, setSession] = React.useState<Session | null>(null);
  const [session, setSession] = React.useState<SessionsType | null>(
    storedSession ? JSON.parse(storedSession) : null
  );

  const navigate = useNavigate();

  const signIn = React.useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  const signOut = React.useCallback(() => {
    setSession(null);
    localStorage.removeItem("session"); // Clear session from storage
    navigate("/sign-in");
  }, [navigate]);

  // Save session to localStorage whenever it changes
  React.useEffect(() => {
    if (session) {
      localStorage.setItem("session", JSON.stringify(session));
    }
  }, [session]);

  const sessionContextValue = React.useMemo(
    () => ({ session, setSession }),
    [session, setSession]
  );
  const filteredNavigation = React.useMemo(() => {
    if (!session?.user?.role) return ALL_NAVIGATION;

    return ALL_NAVIGATION.filter((item) => {
      // Always keep headers
      if (item.kind === "header") return true;

      // If this item has a segment, check permissions
      if ("segment" in item && item.segment) {
        const allowedRoles =
          ROUTE_ROLES[item.segment as keyof typeof ROUTE_ROLES] || [];
        // console.log("Filtered navigation check:", {
        //   item,
        //   allowedRoles,
        //   userRole: session?.user?.role,
        // });
        return allowedRoles.includes(session?.user?.role as any);
      }

      // Items without segments (like Dashboard) are shown
      return true;
    });
  }, [session]);

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <ReactRouterAppProvider
        navigation={filteredNavigation} // Use filtered navigation instead of ALL_NAVIGATION
        branding={BRANDING}
        session={session}
        authentication={{ signIn, signOut }}
      >
        <Outlet />
      </ReactRouterAppProvider>
    </SessionContext.Provider>
  );
}

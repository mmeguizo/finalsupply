// Define and export route-to-role mapping
export const ROUTE_ROLES = {
    "": ["admin", "user"], // Dashboard (default route)
    signatories: ["admin"],
    purchaseorder: ["admin"],
    inventory: ["user", "admin"],
    tests: ["user", "admin"],
  };
// Define and export route-to-role mapping
export const ROUTE_ROLES = {
    "": ["admin", "user"], // Dashboard (default route)
    signatories: ["admin"],
    roles: ["admin"],
    purchaseorder: ["user","admin"],
    inventory: ["user", "admin"],
    "ics-lv-hv": ["user", "admin"],
    requisition: ["user", "admin"],
    property: ["user", "admin"],
    reports: ["user", "admin"],
    users: ["admin"],
  histories: ["admin"],
    issuance: ["user", "admin"],
    "issuance-ris": ["user", "admin"],
    "issuance-par": ["user", "admin"],
    "issuance-ics": ["user", "admin"],
  };
// src/auth/authUtils.ts

/**
 * Clear user session data
 */
export const clearSession = () => {
  localStorage.removeItem("session");
  sessionStorage.clear();
};

/**
 * Save session to localStorage
 */
export const saveSession = (session: any) => {
  if (session) {
    localStorage.setItem("session", JSON.stringify(session));
  }
};

/**
 * Get session from localStorage
 */
export const getStoredSession = () => {
  const storedSession = localStorage.getItem("session");
  return storedSession ? JSON.parse(storedSession) : null;
};

/**
 * Check if user has access to a specific route
 */
export const hasRouteAccess = (userRole: string | undefined, routePath: string, routeRoles: Record<string, string[]>) => {
  if (!userRole) return false;
  const allowedRoles = routeRoles[routePath as keyof typeof routeRoles] || [];
  return allowedRoles.includes(userRole);
};

/**
 * Filter navigation items based on user role
 */
export const filterNavigationByRole = (navigation: any[], userRole: string | undefined, routeRoles: Record<string, string[]>) => {
  if (!userRole) return navigation;

  return navigation.filter((item) => {
    // Always keep headers
    if (item.kind === "header") return true;

    // If this item has a segment, check permissions
    if ("segment" in item && item.segment) {
      const allowedRoles = routeRoles[item.segment as keyof typeof routeRoles] || [];
      return allowedRoles.includes(userRole);
    }

    // Items without segments (like Dashboard) are shown
    return true;
  });
};

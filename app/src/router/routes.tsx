import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Layout from "../layouts/dashboard";
import DashboardPage from "../pages";
import SignatoriesPage from "../pages/signatories";
import SignInPage from "../pages/signIn";
import icsLowHighVolume from "../pages/icsLowHighVolume";
import { ProtectedRoute } from "../auth/protected";
import PurchaseOrder from "../pages/purchaseorder";
import InventoryPage from "../pages/inventory";
import RequisitionPage from "../pages/requisition";
import PropertyPage from "../pages/property";
import ReportsPage from "../pages/reports";
import { UsersPage } from "../pages/users";
import GenericPageTemplate from "../pages/genericPageTemplate";
import RolePage from "../pages/role";
import DepartmentPage from "../pages/department";


export const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            path: "/",
            Component: DashboardPage,
          },
          {
            path: "/purchaseorder",
            children: [
              {
                path: "",
                Component: PurchaseOrder,
              },
            ],
            element: <ProtectedRoute routePath="purchaseorder" />,
          },
          {
            path: "/inventory",
            children: [
              {
                path: "",
                Component: InventoryPage,
              },
            ],
            element: <ProtectedRoute routePath="inventory" />,
          },
          {
            path: "/signatories",
            children: [
              {
                path: "",
                Component: SignatoriesPage,
              },
            ],
            element: <ProtectedRoute routePath="signatories" />,
          },
          {
            path: "/ics-lv-hv",
            element: <ProtectedRoute routePath="ics-lv-hv" />,
            children: [
              {
                path: "",
                Component: icsLowHighVolume,
              },
            ],
          },
          {
            path: "/requisition",
            element: <ProtectedRoute routePath="requisition" />,
            children: [
              {
                path: "",
                Component: RequisitionPage,
              },
            ],
          },
          {
            path: "/property",
            element: <ProtectedRoute routePath="property" />,
            children: [
              {
                path: "",
                Component: PropertyPage,
              },
            ],
          },
          {
            path: "/reports",
            element: <ProtectedRoute routePath="reports" />,
            children: [
              {
                path: "",
                Component: ReportsPage,
              },
            ],
          },
          {
            path: "/users",
            element: <ProtectedRoute routePath="users" />,
            children: [
              {
                path: "users",
                Component: UsersPage,
              },
              {
                path: "role",
                Component: RolePage,
              },
              {
                path: "department",
                Component: DepartmentPage,
              },
            ],
          }
        ],
      },
      {
        path: "/sign-in",
        Component: SignInPage,
      },
    ],
  },
]);

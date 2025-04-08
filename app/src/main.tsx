// import "@mui/material/styles";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Layout from "./layouts/dashboard";
import DashboardPage from "./pages";
import OrdersPage from "./pages/orders";
import SignInPage from "./pages/signIn";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import TestPage from "./pages/test";
import { ProtectedRoute } from "./protected";
import PurchaseOrder from "./pages/purchaseorder";
import InventoryPage from "./pages/inventory";

const cache = new InMemoryCache({
  typePolicies: {
    Purchaseorder: {
      fields: {
        items: {
          // Specify a custom merge function for the items field
          merge(existing = [], incoming = []) {
            return [...incoming]; // Simply use the incoming items
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  // TODO => update uri to production uri
  uri: "http://localhost:4000/graphql",
  // cache: new InMemoryCache(),
  cache: cache,
  credentials: "include",
});

const router = createBrowserRouter([
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
            // Component: OrdersPage,
            children: [
              {
                path: "",
                Component: PurchaseOrder,
              },
            ],
            element: <ProtectedRoute routePath="orders" />,
          },
          {
            path: "/inventory",
            // Component: OrdersPage,
            children: [
              {
                path: "",
                Component: InventoryPage,
              },
            ],
            element: <ProtectedRoute routePath="inventory" />,
          },
          {
            path: "/orders",
            // Component: OrdersPage,
            children: [
              {
                path: "",
                Component: OrdersPage,
              },
            ],
            element: <ProtectedRoute routePath="orders" />,
          },
          {
            path: "/tests",
            element: <ProtectedRoute routePath="tests" />,
            // Component: TestPage,
            children: [
              {
                path: "",
                Component: TestPage,
              },
            ],
          },
        ],
      },
      {
        path: "/sign-in",
        Component: SignInPage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);

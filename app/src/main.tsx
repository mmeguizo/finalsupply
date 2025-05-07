
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apollo/client";
import { router } from "./router/routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);

//TODO  old files neeed cleanup in the future

//old files neeed cleanup in the future
// // import "@mui/material/styles";
// import * as React from "react";
// import * as ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import App from "./App";
// import Layout from "./layouts/dashboard";
// import DashboardPage from "./pages";
// import SignatoriesPage from "./pages/signatories";
// import SignInPage from "./pages/signIn";
// import { ApolloClient, InMemoryCache, ApolloProvider, from, HttpLink } from "@apollo/client";
// import { onError } from "@apollo/client/link/error";
// import TestPage from "./pages/test";
// import { ProtectedRoute } from "./protected";
// import PurchaseOrder from "./pages/purchaseorder";
// import InventoryPage from "./pages/inventory";

// const cache = new InMemoryCache({
//   typePolicies: {
//     Purchaseorder: {
//       fields: {
//         items: {
//           // Specify a custom merge function for the items field
//           merge(existing = [], incoming = []) {
//             return [...incoming]; // Simply use the incoming items
//           },
//         },
//       },
//     },
//   },
// });

// // Create a function that can be called from anywhere to handle unauthorized errors
// const handleUnauthorized = () => {
//   // Clear cookies
//   document.cookie.split(";").forEach((cookie) => {
//     document.cookie = cookie
//       .replace(/^ +/, "")
//       .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
//   });
  
//   // Clear local storage
//   localStorage.removeItem("session");
  
//   // Clear session storage
//   sessionStorage.clear();
  
//   // Redirect to sign-in page
//   window.location.href = '/sign-in';
// };

// // Create an error link that catches unauthorized errors
// const errorLink = onError(({ graphQLErrors, networkError }) => {
//   if (graphQLErrors) {
//     for (let err of graphQLErrors) {
//       if (err.message === 'Unauthorized') {
//         console.log('Unauthorized error detected, redirecting to sign-in page');
//         handleUnauthorized();
//       }
//     }
//   }
// });

// const httpLink = new HttpLink({
//   uri: "http://localhost:4000/graphql",
//   credentials: "include",
// });

// const client = new ApolloClient({
//   link: from([errorLink, httpLink]),
//   cache: cache,
// });

// const router = createBrowserRouter([
//   {
//     Component: App,
//     children: [
//       {
//         path: "/",
//         Component: Layout,
//         children: [
//           {
//             path: "/",
//             Component: DashboardPage,
//           },
//           {
//             path: "/purchaseorder",
//             // Component: SignatoriesPage,
//             children: [
//               {
//                 path: "",
//                 Component: PurchaseOrder,
//               },
//             ],
//             element: <ProtectedRoute routePath="purchaseorder" />,
//           },
//           {
//             path: "/inventory",
//             // Component: SignatoriesPage,
//             children: [
//               {
//                 path: "",
//                 Component: InventoryPage,
//               },
//             ],
//             element: <ProtectedRoute routePath="inventory" />,
//           },
//           {
//             path: "/signatories",
//             // Component: SignatoriesPage,
//             children: [
//               {
//                 path: "",
//                 Component: SignatoriesPage,
//               },
//             ],
//             element: <ProtectedRoute routePath="signatories" />,
//           },
//           {
//             path: "/tests",
//             element: <ProtectedRoute routePath="tests" />,
//             // Component: TestPage,
//             children: [
//               {
//                 path: "",
//                 Component: TestPage,
//               },
//             ],
//           },
//         ],
//       },
//       {
//         path: "/sign-in",
//         Component: SignInPage,
//       },
//     ],
//   },
// ]);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <ApolloProvider client={client}>
//       <RouterProvider router={router} />
//     </ApolloProvider>
//   </React.StrictMode>
// );

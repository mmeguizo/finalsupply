// src/pages/signIn.tsx
"use client";
import * as React from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import { useNavigate } from "react-router";
import { useSession } from "../auth/SessionContext";
import { useApolloClient } from "@apollo/client";
import { loginUser } from "../auth/LoginService";

export default function SignIn() {
  const client = useApolloClient();
  const { setSession } = useSession();
  const navigate = useNavigate();

  return (
    <SignInPage
      providers={[{ id: "credentials", name: "Credentials" }]}
      signIn={async (provider, formData, callbackUrl) => {
        try {
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;
          
          const session = await loginUser(client, email, password);
          
          if (session) {
            setSession(session);
            navigate(callbackUrl || "/", { replace: true });
            return {};
          }
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : "An error occurred",
          };
        }
        return {};
      }}
    />
  );
}


//TODO clean up code in the future
// "use client";
// import * as React from "react";
// import { SignInPage } from "@toolpad/core/SignInPage";
// // import type { Session } from "@toolpad/core/AppProvider";
// import { useNavigate } from "react-router";
// import { useSession } from "../SessionContext";
// import { LOGIN } from "../graphql/mutations/user.mutation";
// import { useMutation } from "@apollo/client";
// import { SessionsType } from "../types/genericTypes";

// export default function SignIn() {
//   const [login, { loading, error }] = useMutation(LOGIN);

//   const AsyncGetSession = async (formData: any): Promise<SessionsType> => {
//     const data = await login({
//       variables: {
//         input: {
//           email: formData.get("email"),
//           password: formData.get("password"),
//         },
//       },
//     });
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         if (data) {
//           resolve({
//             user: {
//               name: data?.data?.login?.name,
//               email: data?.data?.login?.email,
//               image: data?.data?.login?.profile_pic,
//               role: data?.data?.login?.role,
//             },
//           });
//         }
//         reject(new Error("Incorrect credentials."));
//       }, 1000);
//     });
//   };

//   const { setSession } = useSession();
//   const navigate = useNavigate();
//   return (
//     <SignInPage
//       providers={[{ id: "credentials", name: "Credentials" }]}
//       signIn={async (provider, formData, callbackUrl) => {
//         // Demo session
//         try {
//           const session = await AsyncGetSession(formData);
//           if (session) {
//             setSession(session);
//             navigate(callbackUrl || "/", { replace: true });
//             return {};
//           }
//         } catch (error) {
//           return {
//             error: error instanceof Error ? error.message : "An error occurred",
//           };
//         }
//         return {};
//       }}
//     />
//   );
// }

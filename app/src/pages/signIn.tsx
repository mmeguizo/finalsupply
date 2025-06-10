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


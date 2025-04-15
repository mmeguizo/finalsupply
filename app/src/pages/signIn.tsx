"use client";
import * as React from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
// import type { Session } from "@toolpad/core/AppProvider";
import { useNavigate } from "react-router";
import { useSession } from "../SessionContext";
import { LOGIN } from "../graphql/mutations/user.mutation";
import { useMutation } from "@apollo/client";
import { SessionsType } from "../types/genericTypes";

export default function SignIn() {
  const [login, { loading, error }] = useMutation(LOGIN);

  const AsyncGetSession = async (formData: any): Promise<SessionsType> => {
    const data = await login({
      variables: {
        input: {
          email: formData.get("email"),
          password: formData.get("password"),
        },
      },
    });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data) {
          resolve({
            user: {
              name: data?.data?.login?.name,
              email: data?.data?.login?.email,
              image: data?.data?.login?.profile_pic,
              role: data?.data?.login?.role,
            },
          });
        }
        reject(new Error("Incorrect credentials."));
      }, 1000);
    });
  };

  const { setSession } = useSession();
  const navigate = useNavigate();
  return (
    <SignInPage
      providers={[{ id: "credentials", name: "Credentials" }]}
      signIn={async (provider, formData, callbackUrl) => {
        // Demo session
        try {
          const session = await AsyncGetSession(formData);
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

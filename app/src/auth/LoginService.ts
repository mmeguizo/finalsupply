// src/auth/LoginService.ts
import { ApolloClient } from "@apollo/client";
import { LOGIN } from "../graphql/mutations/user.mutation";
import { SessionsType } from "../types/genericTypes";

export const loginUser = async (
  client: ApolloClient<any>,
  email: string,
  password: string
): Promise<SessionsType> => {
  try {
    const { data } = await client.mutate({
      mutation: LOGIN,
      variables: {
        input: {
          email,
          password,
        },
      },
    });

    if (data?.login) {
      return {
        user: {
          name: data.login.name,
          email: data.login.email,
          image: data.login.profile_pic,
          role: data.login.role,
        },
      };
    }
    
    throw new Error("Login failed");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "An error occurred");
  }
};

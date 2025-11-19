import { ApolloClient, from, HttpLink } from "@apollo/client";
import { errorLink } from "./errorHandling";
import { cache } from "./cacheConfig";

const httpLink = new HttpLink({
  uri: "http://192.168.156.105:4000/graphql",
  // uri: "http://localhost:4000/graphql",
  credentials: "include",
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: cache,
});

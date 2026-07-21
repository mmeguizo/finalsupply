import { ApolloClient, from, HttpLink } from '@apollo/client';
import { errorLink } from './errorHandling';
import { cache } from './cacheConfig';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || '/graphql';

const httpLink = new HttpLink({
  uri: graphqlUrl,
  credentials: 'include',
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: cache,
});

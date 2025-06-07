// apps/finsense-ai/src/app/apollo-client.ts
import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { store } from './store'; // Adjust the import path as necessary

// Create the upload link
const uploadLink = createUploadLink({
  uri: 'http://localhost:4000/graphql',
});

// Auth middleware using token from Redux store
const authLink = setContext((_, { headers }) => {
  const state = store.getState();
  const token = state.auth.token;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Apollo Client instance
const client = new ApolloClient({
  link: ApolloLink.from([authLink, uploadLink]),
  cache: new InMemoryCache(),
});

export default client;

import { ApolloClient, InMemoryCache } from '@apollo/client'

export const apolloClient = (uri: string) =>
  new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  })

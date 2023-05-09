import React from 'react'
import { ApolloProvider } from '@apollo/client'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'
import { ErrorFallback } from './containers/ErrorFallback'
import { GlobalStyle } from './GlobalStyle'
import { apolloClient } from './graphql'
import Routes from './Routes'

export const BASE_PATH = '/hjelpemidler/delbestilling/'

const client = apolloClient(BASE_PATH + '/hjelpemiddeldatabasen')

const App = () => {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <GlobalStyle />
        <ApolloProvider client={client}>
          <Routes />
        </ApolloProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

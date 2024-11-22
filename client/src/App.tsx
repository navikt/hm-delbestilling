import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ErrorFallback } from './containers/ErrorFallback'
import { GlobalStyle } from './GlobalStyle'
import Routes from './Routes'

export const BASE_PATH = '/hjelpemidler/delbestilling/'

const App = () => {
  const queryClient = new QueryClient()

  return (
    <BrowserRouter basename={BASE_PATH}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <GlobalStyle />
        <QueryClientProvider client={queryClient}>
          <Routes />
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

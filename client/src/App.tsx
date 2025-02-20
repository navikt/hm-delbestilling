import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'

import { ErrorFallback } from './containers/ErrorFallback'
import { GlobalStyle } from './GlobalStyle'
import Routes from './Routes'
import ScrollToTop from './components/ScrollToTop'

export const BASE_PATH = '/hjelpemidler/delbestilling/'

const App = () => {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <GlobalStyle />
        <ScrollToTop>
          <Routes />
        </ScrollToTop>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

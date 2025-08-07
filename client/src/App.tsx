import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop'
import { ErrorFallback } from './containers/ErrorFallback'
import { GlobalStyle } from './GlobalStyle'
import Routes from './Routes'

import './index.css'

export const BASE_PATH = '/hjelpemidler/delbestilling/'

const App = () => {
  useEffect(() => {
    if (navigator.webdriver) {
      document.body.classList.add('playwright')
    }
  }, [])

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

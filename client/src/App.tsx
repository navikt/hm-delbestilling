import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop'
import { ErrorFallback } from './containers/ErrorFallback'
import Routes from './Routes'
import { Theme } from '@navikt/ds-react'

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
        <ScrollToTop>
          <Theme theme='light'>
          <Routes />
          </Theme>
        </ScrollToTop>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

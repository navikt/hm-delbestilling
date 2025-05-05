import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter } from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop'
import { ErrorFallback } from './containers/ErrorFallback'
import { GlobalStyle } from './GlobalStyle'
import Routes from './Routes'

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

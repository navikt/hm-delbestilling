import { createRoot } from 'react-dom/client'

import { initDecorator } from './decorator/decorator'
import { initMSW } from './utils/msw'
import App from './App'

import './styles/global.css'
import './styles/variables.css'

import '@navikt/ds-css/darkside'
import './i18n'

declare global {
  interface Window {
    msw: any
    hj: any
    appSettings: {
      GIT_COMMIT?: string
      MILJO?: 'dev-gcp' | 'prod-gcp'
      USE_MSW?: boolean
    }
  }
}

const init = async () => {
  await initMSW()
  initDecorator()
  const rootElement = document.getElementById('root')!!
  createRoot(rootElement).render(<App />)
}

init().catch((err) => console.error(err))

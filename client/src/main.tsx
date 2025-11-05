import { createRoot } from 'react-dom/client'

import { initDecorator } from './decorator/decorator'
import { initAmplitude } from './utils/amplitude'
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
      NAIS_CLUSTER_NAME?: 'dev-gcp' | 'prod-gcp'
      USE_MSW?: boolean
    }
  }
}

const init = async () => {
  await initMSW()
  initAmplitude()
  initDecorator()
  const rootElement = document.getElementById('root')!!
  createRoot(rootElement).render(<App />)
}

init().catch((err) => console.error(err))

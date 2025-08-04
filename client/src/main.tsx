import { createRoot } from 'react-dom/client'

import { initDecorator } from './decorator/decorator'
import { initAmplitude } from './utils/analytics/amplitude'
import { initMSW } from './utils/msw'
import App from './App'

import '@navikt/ds-css'
import './i18n'

interface Umami {
  track(payload: unknown): void
  track(event_name: string, payload: unknown): void
  identify(session_data: unknown): void
}

declare global {
  interface Window {
    msw: any
    hj: any
    umami: Umami | undefined
    appSettings: {
      GIT_COMMIT?: string
      MILJO?: 'dev-gcp' | 'prod-gcp'
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

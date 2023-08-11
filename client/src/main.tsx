import React from 'react'
import { createRoot } from 'react-dom/client'

import { Modal } from '@navikt/ds-react'

import { initDecorator } from './decorator/decorator'
import { initAmplitude } from './utils/amplitude'
import { initMSW } from './utils/msw'
import App from './App'

import '@navikt/ds-css'
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
  initAmplitude()
  initDecorator()
  const rootElement = document.getElementById('root')!!
  if (Modal.setAppElement) {
    Modal.setAppElement(rootElement)
  }
  createRoot(rootElement).render(<App />)
}

init().catch((err) => console.error(err))

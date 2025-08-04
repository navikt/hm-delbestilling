import * as amplitude from '@amplitude/analytics-browser'

import { isConsentingToAnalytics } from '../nav-cookie-consent'

import { DIGIHOT_TAXONOMY, NAV_TAXONOMY } from './analytics'

const SKJEMANAVN = 'hm-delbestilling'

export const initAmplitude = () => {
  if (!isConsentingToAnalytics()) {
    return
  }

  if (amplitude) {
    amplitude.init('default', '', {
      useBatch: false,
      serverUrl: 'https://amplitude.nav.no/collect-auto',
      defaultTracking: false,
      ingestionMetadata: {
        sourceName: window.location.toString(),
      },
    })
  }
}

export const sendAmplitudeEvent = (eventName: NAV_TAXONOMY | DIGIHOT_TAXONOMY, data?: Record<string, unknown>) => {
  setTimeout(() => {
    data = {
      app: 'hm-delbestilling',
      skjemanavn: SKJEMANAVN,
      team: 'teamdigihot',
      ...data,
    }
    try {
      if (amplitude) {
        amplitude.track(eventName, data)
      }
    } catch (error) {
      console.error(error)
    }
  })
}

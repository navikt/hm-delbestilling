import { isProd } from '../utils'

import { DIGIHOT_TAXONOMY, NAV_TAXONOMY } from './analytics'

export const UMAMI_WEBSITE_ID = isProd()
  ? '35abb2b7-3f97-42ce-931b-cf547d40d967' // Nav.no - prod
  : '7ea31084-b626-4535-ab44-1b2d43001366' // hjelpemidler - dev

export const sendUmamiEvent = (eventName: NAV_TAXONOMY | DIGIHOT_TAXONOMY, data?: Record<string, unknown>) => {
  if (window.umami && typeof window.umami.track === 'function') {
    window.umami.track(eventName, data)
  }
}

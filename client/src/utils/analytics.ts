import * as amplitude from '@amplitude/analytics-browser'

import { isConsentingToAnalytics } from './nav-cookie-consent'
import { isProd } from './utils'

export enum nav_taxonomy {
  SKJEMA_START = 'skjema startet',
  SKJEMA_ÅPEN = 'skjema åpnet',
  SKJEMASTEG_FULLFØRT = 'skjemasteg fullført',
  SKJEMAVALIDERING_FEILET = 'skjemavalidering feilet',
  SKJEMAINNSENDING_FEILET = 'skjemainnsending feilet',
  SKJEMA_FULLFØRT = 'skjema fullført',
  NAVIGERE = 'navigere',
}

//Events som ikke er i NAV sin taxonomi
export enum digihot_taxonomy {
  SKJEMA_SLETTET = 'skjema slettet',
  SPRÅK_ENDRET = 'språk endret',
  OPPSLAG_GJORT = 'gjort oppslag på artnr og serienr',
  OPPSLAG_FEIL = 'feil på oppslag',
  KATEGORI_FILTRERING = 'filtrering på kategori',
  INNSENDING_FEIL = 'feil ved innsending',
  START_NY_BESTILING = 'start ny bestilling',
  PRINT_AV_BESTILLING_ÅPNET = 'print av bestilling åpnet',
  KLIKK_PÅ_VIS_KUN_FAST_LAGERVARE = 'klikk på vis kun fast lagervare',
  KLIKK_ÅPNING_AV_BILDEKARUSELL = 'åpning av bildekarusell',
}

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

export function logAmplitudeEvent(eventName: string, data?: any) {
  if (!isConsentingToAnalytics()) {
    return
  }
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

export const umamiWebsiteId = isProd()
  ? '35abb2b7-3f97-42ce-931b-cf547d40d967' // Nav.no - prod
  : '7ea31084-b626-4535-ab44-1b2d43001366' // hm-delbestilling - dev

const logUmamiEvent = (event: string, data?: Record<string, unknown>) => {
  if (!isConsentingToAnalytics()) {
    return
  }

  console.log('[debug] window.umami:', window.umami)
  if (window.umami && typeof window.umami.track === 'function') {
    console.log('tracker data', data)
    window.umami.track(event, data)
  }
}

export const logSpråkEndret = (språk: string) => {
  logAmplitudeEvent(digihot_taxonomy.SPRÅK_ENDRET, { språk })
  logUmamiEvent(digihot_taxonomy.SPRÅK_ENDRET, { språk })
}

export const logOppslagGjort = (hmsnr: string) => {
  logAmplitudeEvent(digihot_taxonomy.OPPSLAG_GJORT, { artnr: hmsnr })
  logUmamiEvent(digihot_taxonomy.OPPSLAG_GJORT, { artnr: hmsnr })
}

export const logOppslagFeil = (oppslagFeil: string, hmsnr: string, statuskode?: number) => {
  logAmplitudeEvent(digihot_taxonomy.OPPSLAG_FEIL, { oppslagFeil, artnr: hmsnr, statuskode })
  logUmamiEvent(digihot_taxonomy.OPPSLAG_FEIL, { oppslagFeil, artnr: hmsnr, statuskode })
}

export const logKategoriFiltreringGjort = (filter: string) => {
  logAmplitudeEvent(digihot_taxonomy.KATEGORI_FILTRERING, { filter })
  logUmamiEvent(digihot_taxonomy.KATEGORI_FILTRERING, { filter })
}

export const logKlikkVisKunFastLagervare = (checked: boolean) => {
  logAmplitudeEvent(digihot_taxonomy.KLIKK_PÅ_VIS_KUN_FAST_LAGERVARE, {
    checked,
  })
  logUmamiEvent(digihot_taxonomy.KLIKK_PÅ_VIS_KUN_FAST_LAGERVARE, {
    checked,
  })
}

export const logSkjemavalideringFeilet = (feil: string[] | undefined) => {
  logAmplitudeEvent(nav_taxonomy.SKJEMAVALIDERING_FEILET, {
    feil,
  })
  logUmamiEvent(nav_taxonomy.SKJEMAVALIDERING_FEILET, {
    feil,
  })
}

export const logInnsendingGjort = (id: string) => {
  logAmplitudeEvent(nav_taxonomy.SKJEMA_FULLFØRT, { id })
  logUmamiEvent(nav_taxonomy.SKJEMA_FULLFØRT, { id })
}

export const logInnsendingFeil = (feil: string) => {
  logAmplitudeEvent(digihot_taxonomy.INNSENDING_FEIL, { feil })
  logUmamiEvent(digihot_taxonomy.INNSENDING_FEIL, { feil })
}

export const logBestillingSlettet = () => {
  logAmplitudeEvent(digihot_taxonomy.SKJEMA_SLETTET)
  logUmamiEvent(digihot_taxonomy.SKJEMA_SLETTET)
}

export const logStartNyBestilling = () => {
  logAmplitudeEvent(digihot_taxonomy.START_NY_BESTILING)
  logUmamiEvent(digihot_taxonomy.START_NY_BESTILING)
}

export const logPrintAvBestillingÅpnet = (pathname: string) => {
  logAmplitudeEvent(digihot_taxonomy.PRINT_AV_BESTILLING_ÅPNET, {
    pathname,
  })
  logUmamiEvent(digihot_taxonomy.PRINT_AV_BESTILLING_ÅPNET, {
    pathname,
  })
}

export const logÅpningAvBildekarusell = () => {
  logAmplitudeEvent(digihot_taxonomy.KLIKK_ÅPNING_AV_BILDEKARUSELL)
  logUmamiEvent(digihot_taxonomy.KLIKK_ÅPNING_AV_BILDEKARUSELL)
}

import * as amplitude from '@amplitude/analytics-browser'
import { isConsentingToAnalytics } from './nav-cookie-consent'

export enum amplitude_taxonomy {
  SKJEMA_START = 'skjema startet',
  SKJEMA_ÅPEN = 'skjema åpnet',
  SKJEMASTEG_FULLFØRT = 'skjemasteg fullført',
  SKJEMAVALIDERING_FEILET = 'skjemavalidering feilet',
  SKJEMAINNSENDING_FEILET = 'skjemainnsending feilet',
  SKJEMA_FULLFØRT = 'skjema fullført',
  NAVIGERE = 'navigere',
}

//Events som ikke er i NAV sin taxonomi
export enum digihot_customevents {
  SKJEMA_SLETTET = 'skjema slettet',
  SPRÅK_ENDRET = 'språk endret',
  OPPSLAG_GJORT = 'gjort oppslag på artnr og serienr',
  OPPSLAG_FEIL = 'feil på oppslag',
  KATEGORI_FILTRERING = 'filtrering på kategori',
  INNSENDING_FEIL = 'feil ved innsending',
  START_NY_BESTILING = 'start ny bestilling',
  PRINT_AV_BESTILLING_ÅPNET = 'print av bestilling åpnet',
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

export const logSpråkEndret = (språk: string) => {
  logAmplitudeEvent(digihot_customevents.SPRÅK_ENDRET, { språk })
}

export const logOppslagGjort = (hmsnr: string) => {
  logAmplitudeEvent(digihot_customevents.OPPSLAG_GJORT, { artnr: hmsnr })
}

export const logOppslagFeil = (oppslagFeil: string, hmsnr: string, statuskode?: number) => {
  logAmplitudeEvent(digihot_customevents.OPPSLAG_FEIL, { oppslagFeil, artnr: hmsnr, statuskode })
}

export const logKategoriFiltreringGjort = (filter: string) => {
  logAmplitudeEvent(digihot_customevents.KATEGORI_FILTRERING, { filter })
}

export const logSkjemavalideringFeilet = (feil: string[] | undefined) => {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMAVALIDERING_FEILET, {
    feil,
  })
}

export const logInnsendingGjort = (id: string) => {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMA_FULLFØRT, { id })
}

export const logInnsendingFeil = (feil: string) => {
  logAmplitudeEvent(digihot_customevents.INNSENDING_FEIL, { feil })
}

export const logBestillingSlettet = () => {
  logAmplitudeEvent(digihot_customevents.SKJEMA_SLETTET)
}

export const logStartNyBestilling = () => {
  logAmplitudeEvent(digihot_customevents.START_NY_BESTILING)
}

export const logPrintAvBestillingÅpnet = (pathname: string) => {
  logAmplitudeEvent(digihot_customevents.PRINT_AV_BESTILLING_ÅPNET, {
    pathname,
  })
}

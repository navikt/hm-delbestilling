import { getAnalyticsInstance } from '@navikt/nav-dekoratoren-moduler'

import { isConsentingToAnalytics } from '../nav-cookie-consent'

export const SKJEMANAVN = 'hm-delbestilling'

export enum NAV_TAXONOMY {
  SKJEMA_START = 'skjema startet',
  SKJEMA_ÅPEN = 'skjema åpnet',
  SKJEMASTEG_FULLFØRT = 'skjemasteg fullført',
  SKJEMAVALIDERING_FEILET = 'skjemavalidering feilet',
  SKJEMAINNSENDING_FEILET = 'skjemainnsending feilet',
  SKJEMA_FULLFØRT = 'skjema fullført',
  NAVIGERE = 'navigere',
}

//Events som ikke er i NAV sin taxonomi
export enum DIGIHOT_TAXONOMY {
  SKJEMA_SLETTET = 'skjema slettet',
  SPRÅK_ENDRET = 'språk endret',
  OPPSLAG_GJORT = 'gjort oppslag på artnr og serienr',
  OPPSLAG_FEIL = 'feil på oppslag',
  KATEGORI_FILTRERING = 'filtrering på kategori',
  INNSENDING_FEIL = 'feil ved innsending',
  START_NY_BESTILLING = 'start ny bestilling',
  PRINT_AV_BESTILLING_ÅPNET = 'print av bestilling åpnet',
  KLIKK_PÅ_VIS_KUN_FAST_LAGERVARE = 'klikk på vis kun fast lagervare',
  KLIKK_ÅPNING_AV_BILDEKARUSELL = 'åpning av bildekarusell',
}

const APP_NAVN = 'hm-delbestilling'

function logEvent(eventName: NAV_TAXONOMY | DIGIHOT_TAXONOMY, data?: Record<string, unknown>) {
  if (!isConsentingToAnalytics()) {
    return
  }

  const logger = getAnalyticsInstance(APP_NAVN)
  logger(eventName, data)
}
export const logSpråkEndret = (språk: string) => {
  logEvent(DIGIHOT_TAXONOMY.SPRÅK_ENDRET, { språk })
}

export const logOppslagGjort = (hmsnr: string) => {
  logEvent(DIGIHOT_TAXONOMY.OPPSLAG_GJORT, { artnr: hmsnr })
}

export const logOppslagFeil = (oppslagFeil: string, hmsnr: string, statuskode?: number) => {
  logEvent(DIGIHOT_TAXONOMY.OPPSLAG_FEIL, { oppslagFeil, artnr: hmsnr, statuskode })
}

export const logKategoriFiltreringGjort = (filter: string) => {
  logEvent(DIGIHOT_TAXONOMY.KATEGORI_FILTRERING, { filter })
}

export const logKlikkVisKunFastLagervare = (checked: boolean) => {
  logEvent(DIGIHOT_TAXONOMY.KLIKK_PÅ_VIS_KUN_FAST_LAGERVARE, {
    checked,
  })
}

export const logSkjemavalideringFeilet = (feil: string[] | undefined) => {
  logEvent(NAV_TAXONOMY.SKJEMAVALIDERING_FEILET, {
    feil,
  })
}

export const logInnsendingGjort = (id: string) => {
  logEvent(NAV_TAXONOMY.SKJEMA_FULLFØRT, { id })
}

export const logInnsendingFeil = (feil: string) => {
  logEvent(DIGIHOT_TAXONOMY.INNSENDING_FEIL, { feil })
}

export const logBestillingSlettet = () => {
  logEvent(DIGIHOT_TAXONOMY.SKJEMA_SLETTET)
}

export const logStartNyBestilling = () => {
  logEvent(DIGIHOT_TAXONOMY.START_NY_BESTILLING)
}

export const logPrintAvBestillingÅpnet = (pathname: string) => {
  logEvent(DIGIHOT_TAXONOMY.PRINT_AV_BESTILLING_ÅPNET, {
    pathname,
  })
}

export const logÅpningAvBildekarusell = () => {
  logEvent(DIGIHOT_TAXONOMY.KLIKK_ÅPNING_AV_BILDEKARUSELL)
}

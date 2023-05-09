import amplitude from 'amplitude-js'

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
  SKJEMA_FORTSATT = 'skjema fortsatt',
  SKJEMA_SLETTET = 'skjema slettet',
  HJELPEMIDDEL_LAGT_TIL = 'hjelpemiddel lagt til',
  HJELPEMIDDEL_FJERNET = 'hjelpemiddel fjernet',
  HJELPEMIDDEL_OPPDATERT = 'hjelpemiddel oppdatert',
  TILBEHOR_LAGT_TIL = 'tilbehør lagt til',
  TILBEHOR_LAGT_TIL_FRA_FORSLAGSMOTOREN = 'tilbehør lagt til fra forslagsmotoren',
  TILBEHOR_FJERNET = 'tilbehør fjernet',
  TILBEHOR_FORSLAG_SEALLE_APNET = 'tilbehør forslag se alle åpnet',
  TILBEHOR_FORSLAG_SEALLE_LUKKET = 'tilbehør forslag se alle lukket',
  TILBEHOR_FORSLAG_FALLBACK_GAMMEL_LOSNING = 'tilbehør forslag fallback gammel løsning',
  TILBEHOR_ER_HOVEDPRODUKT = 'tilbehør er hovedprodukt',
  TILBEHOR_ER_HOVEDPRODUKT_IKKE_DIGITALT = 'tilbehør er hovedprodukt ikke digitalt',
  TILBEHOR_VEILEDERPANEL_LINK_LOVDATA = 'tilbehør veilederpanel link lovdata',
  TILBEHOR_VEILEDERPANEL_LINK_HMDB_RAMMEAVTALE = 'tilbehør veilederpanel link hmdb rammeavtale',
  INGEN_TILGANG = 'vist at innsender ikke har noen gyldig rolle (ingen tilgang)',
  VIS_BEKREFT_BESTILLER = 'vist bestiller må bekrefte godkjenning fra leder',
  BEKREFTET_BESTILLER = 'huket av for at bestiller er godkjent av leder',
  VIST_STARTSIDE = 'vist startside',
  DELEGATIONREQUEST_POST_TO_ALTINN = 'post delegationrequest til altinn',
  DELEGATIONREQUEST_CALLBACK_STATUS_OK = 'delegationrequest ok',
  DELEGATIONREQUEST_CALLBACK_STATUS_NOT_OK = 'delegationrequest ikke ok',
  VALGT_FULLMAKT = 'valgt fullmakt',
  VALGT_BRUKERBEKREFTELSE = 'valgt brukerbekreftelse',
  VALGT_FRITAK_FRA_FULLMAKT = 'ingen fullmakt grunnet korona',
  VARSEL_OM_SESJON_UTLOPER = 'varsel vist om sesjon utløper',
  VARSEL_OM_SESJON_UTLOPT = 'varsel vist om sesjon utløpt',
  KLIKK_VIS_INNSENDT_SØKNAD_I_FORMIDLERVISNING = 'klikk vis innsendt søknad i formidlervisning',
  KLIKK_VIS_INNSENDT_SØKNAD_SOM_PDF = 'klikk vis innsendt søknad som pdf',
  SPRAAK_ENDRET = 'språk endret',
  KLIKK_ACCORDION = 'klikk på accordion',
  FETCH_TIMEOUT = 'fetch timeout',
  BESTILLINGSJEKK_FEILET_NETTVERK = 'bestillingsordning-sjekker feilet nettverksproblem',
  BESTILLINGSJEKK_FEILET_UNDERTJENESTER_UTILGJENGELIG = 'bestillingsordning-sjekker feilet undertjenester utilgjengelig',
  BESTILLINGSSJEKK_OPPSUMMERINGSSIDE = 'oppsummeringsside viser bestilling',
  BESTILLINGSSJEKK_FOR_BESTILLER_NEGATIVT_RESULTAT = 'bestillingsjekk for bestiller ga negativt resultat (skal ikke kunne skje)',
  KLIKK_VIS_HJELPEMIDLER_LAGT_TIL = 'klikk på vis hjelpemidler lagt til',
}

const SKJEMANAVN = 'hm-delbestilling'

export const initAmplitude = () => {
  if (amplitude) {
    amplitude.getInstance().init('default', '', {
      apiEndpoint: 'amplitude.nav.no/collect-auto',
      saveEvents: false,
      includeUtm: true,
      includeReferrer: true,
      platform: window.location.toString(),
    })
  }
}

export function logAmplitudeEvent(eventName: string, data?: any) {
  setTimeout(() => {
    data = {
      app: 'hm-delbestilling',
      team: 'teamdigihot',
      ...data,
    }
    try {
      if (amplitude) {
        amplitude.getInstance().logEvent(eventName, data)
      }
    } catch (error) {
      console.error(error)
    }
  })
}

export function logVisningBestillingsside(id: string, erBestilling: boolean, rolle: string | undefined) {
  logAmplitudeEvent(digihot_customevents.BESTILLINGSSJEKK_OPPSUMMERINGSSIDE, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    erBestilling: erBestilling,
    rolle,
  })
}

export function logSkjemastegFullfoert(id: string, steg: number, rolle: string | undefined) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMASTEG_FULLFØRT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    steg: steg,
    rolle,
  })
}

export function logSkjemaStartet(id: string, steg: number, rolle: string | undefined) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMA_START, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    steg: steg,
    rolle,
  })
}

export function logSkjemavalideringFeilet(id: string, komponent: string, feilmeldinger: string[] | undefined) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMAVALIDERING_FEILET, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    skjemaside: komponent,
    feilmeldinger: feilmeldinger,
  })
}

export function logSkjemaFullfoert(
  id: string,
  data: { fraUtkast: boolean; tidBruktSekunder: number | undefined; erBestilling: boolean; rolle: string | undefined }
) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMA_FULLFØRT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    ...data,
  })
}

export function logSkjemainnsendingFeilet(
  id: string,
  error: { status: number; message: string | undefined; erBestilling: boolean; rolle: string | undefined }
) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMAINNSENDING_FEILET, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    ...error,
  })
}

export function logNavigeringLenke(id: string, destinasjon: string, lenketekst: string) {
  logAmplitudeEvent(amplitude_taxonomy.NAVIGERE, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    destinasjon: destinasjon,
    lenketekst: lenketekst,
  })
}

export function logVistSesjonUtloperVarsel(id: string, data: { sekunderTilUtlop: number }) {
  logAmplitudeEvent(digihot_customevents.VARSEL_OM_SESJON_UTLOPER, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    ...data,
  })
}

export function logVistSesjonUtloptVarsel(id: string) {
  logAmplitudeEvent(digihot_customevents.VARSEL_OM_SESJON_UTLOPT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
  })
}

export function logSkjemaSlettet(id: string, steg: number, erBestilling: boolean, rolle: string | undefined) {
  logAmplitudeEvent(digihot_customevents.SKJEMA_SLETTET, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    steg: steg,
    erBestilling: erBestilling,
    rolle,
  })
}

export function logSkjemaCustomEvent(event: digihot_customevents, id: string, data?: any) {
  logAmplitudeEvent(event, {
    skjemanavn: SKJEMANAVN,
    skjemaId: id,
    ...data,
  })
}

export function logCustomEvent(event: digihot_customevents, data?: any) {
  logAmplitudeEvent(event, {
    skjemanavn: SKJEMANAVN,
    ...data,
  })
}

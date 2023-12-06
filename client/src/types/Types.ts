export interface Hjelpemiddel {
  navn: string
  hmsnr: string
  deler: Del[] | undefined
  type: string
}

export interface Del {
  navn: string
  hmsnr: string
  levArtNr: string | null
  img: string | null
  kategori: string
  maksAntall: number
  defaultAntall: number
}

export interface Handlekurv {
  id: string
  serienr: string
  hjelpemiddel: Hjelpemiddel
  deler: Dellinje[]
  levering: Levering | undefined
  harOpplæringPåBatteri: boolean | undefined
}

export interface Dellinje {
  del: Del
  antall: number
  status?: Dellinjestatus
  datoSkipningsbekreftet?: string
  forventetLeveringsdato?: string
}

export interface Delbestilling {
  id: string
  hmsnr: string
  serienr: string
  navn: string
  deler: Dellinje[]
  levering: Levering
  rolle: Rolle | null
  harOpplæringPåBatteri: boolean | undefined
}

export enum Rolle {
  TEKNIKER = 'TEKNIKER',
  BRUKERPASS = 'BRUKERPASS',
}

export interface DelbestillingSak {
  saksnummer: number
  delbestilling: Delbestilling
  opprettet: string
  status: Ordrestatus
  sistOppdatert: string
  oebsOrdrenummer: string | null
}

export enum Ordrestatus {
  INNSENDT = 'INNSENDT',
  REGISTRERT = 'REGISTRERT',
  KLARGJORT = 'KLARGJORT',
  DELVIS_SKIPNINGSBEKREFTET = 'DELVIS_SKIPNINGSBEKREFTET',
  SKIPNINGSBEKREFTET = 'SKIPNINGSBEKREFTET',
  LUKKET = 'LUKKET',
  ANNULLERT = 'ANNULLERT',
}

export enum Dellinjestatus {
  SKIPNINGSBEKREFTET = 'SKIPNINGSBEKREFTET',
}

export enum Levering {
  TIL_XK_LAGER = 'TIL_XK_LAGER',
  TIL_SERVICE_OPPDRAG = 'TIL_SERVICE_OPPDRAG',
}

export interface Delbestillerrolle {
  erTekniker: boolean
  erBrukerpassbruker: boolean
  kanBestilleDeler: boolean
  harXKLager: boolean
  erKommunaltAnsatt: boolean
  kommunaleOrgs: Organisasjon[] | undefined
}

export interface Næringskode {
  kode: string
  beskrivelse: string
}

export interface Organisasjon {
  orgnr: string
  navn: string
  orgform: string
  overordnetOrgnr: string | null
  næringskoder: Næringskode[]
  kommunenummer: string | null
}

export interface Næringskode {
  kode: string
  beskrivelse: string
}

export type Valg = 'mine' | 'kommunens'

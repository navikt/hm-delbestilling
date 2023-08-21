export interface Hjelpemiddel {
  navn: string
  hmsnr: string
  deler: Del[] | undefined
}

export interface Del {
  navn: string
  hmsnr: string
  levArtNr: string | null
  img: string | null
  kategori: string
  maksAntall: number
}

export interface Handlekurv {
  id: string
  serienr: string
  hjelpemiddel: Hjelpemiddel
  deler: DelLinje[]
  levering: Levering | undefined
}

export interface DelLinje {
  del: Del
  antall: number
}

export interface Delbestilling {
  id: string
  hmsnr: string
  serienr: string
  deler: DelLinje[]
  levering: Levering
  rolle: Rolle | null
}

export enum Rolle {
  TEKNIKER = 'TEKNIKER',
  BRUKERPASS = 'BRUKERPASS',
}

export interface DelbestillingSak {
  saksnummer: number
  delbestilling: Delbestilling
  status: Status
  opprettet: Date
  sistOppdatert: Date
}

export enum Status {
  INNSENDT = 'INNSENDT',
  KLARGJORT = 'KLARGJORT',
  REGISTRERT = 'REGISTRERT',
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
  kommunaleOrgs: Organisasjon[]
  erKommunaltAnsatt: boolean
  erIPilot: boolean
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

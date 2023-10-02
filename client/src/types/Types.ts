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
}

export interface Handlekurv {
  id: string
  serienr: string
  hjelpemiddel: Hjelpemiddel
  deler: DelLinje[]
  levering: Levering | undefined
  harOpplæringPåBatteri: boolean | undefined
}

export interface DelLinje {
  del: Del
  antall: number
}

export interface Delbestilling {
  id: string
  hmsnr: string
  serienr: string
  navn: string | undefined
  deler: DelLinje[]
  levering: Levering
  harOpplæringPåBatteri: boolean | undefined
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
  kanBestilleDeler: boolean
  harXKLager: boolean
  erKommunaltAnsatt: boolean
  kommunaleOrgs: Organisasjon[] | undefined
}

export interface Organisasjon {
  orgnr: string
  navn: string
  orgform: string
  overordnetOrgnr: string | undefined
  næringskoder: Næringskode[]
  kommunenummer: string | undefined
}

export interface Næringskode {
  kode: string
  beskrivelse: string
}

export type Valg = 'mine' | 'kommunens'

import { Pilot } from './HttpTypes'

export interface Hjelpemiddel {
  navn: string
  hmsnr: string
  deler: Del[] | undefined
}

export interface Del {
  navn: string
  hmsnr: string
  levArtNr: string | null
  imgs: string[]
  kategori: string
  maksAntall: number
  defaultAntall: number
  datoLagtTil?: string
  lagerstatus: Lagerstatus
  kilde: string
}

export interface Lagerstatus {
  organisasjons_id: number
  organisasjons_navn: string
  artikkelnummer: string
  minmax: boolean
  tilgjengelig: number
  antallDelerPåLager: number
}

export interface Handlekurv {
  id: string
  serienr: string
  hjelpemiddel: Hjelpemiddel
  deler: Dellinje[]
  levering: Levering | undefined
  harOpplæringPåBatteri: boolean | undefined
  piloter: Pilot[]
}

export interface Dellinje {
  del: Del
  antall: number
  status?: Dellinjestatus
  datoSkipningsbekreftet?: string
  forventetLeveringsdato?: string
  lagerstatusPåBestillingstidspunkt?: Lagerstatus
}

export interface Delbestilling {
  id: string
  hmsnr: string
  serienr: string
  navn: string
  deler: Dellinje[]
  levering: Levering
  harOpplæringPåBatteri: boolean | undefined
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
  kanBestilleDeler: boolean
  kommunaleOrgs: Organisasjon[]
  erKommunaltAnsatt: boolean
  godkjenteIkkeKommunaleOrgs: Organisasjon[]
  erAnsattIGodkjentIkkeKommunaleOrgs: boolean
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

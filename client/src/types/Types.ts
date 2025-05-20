export interface Hjelpemiddel {
  navn: string
  hmsnr: string
  deler: Del[] | undefined
  antallDagerSidenSistBatteribestilling: number | null
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
  erBrukerpassbruker: boolean
  erTekniker: boolean
  kanBestilleDeler: boolean
  kommunaleOrgs: Organisasjon[]
  erKommunaltAnsatt: boolean
  godkjenteIkkeKommunaleOrgs: Organisasjon[]
  kommunaleAnsettelsesforhold: Organisasjon[]
  privateAnsettelsesforhold: Organisasjon[]
  representasjoner: Organisasjon[]
  erAnsattIGodkjentIkkeKommunaleOrgs: boolean
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

export enum Pilot {
  BESTILLE_IKKE_FASTE_LAGERVARER = 'BESTILLE_IKKE_FASTE_LAGERVARER',
}

export type Valg = 'mine' | 'kommunens'

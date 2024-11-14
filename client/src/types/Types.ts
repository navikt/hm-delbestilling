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
  defaultAntall: number
  datoLagtTil?: string
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

export interface Tilgangsforespørselgrunnlag {
  navn: string
  arbeidsforhold: Arbeidsforhold[]
}

export interface Tilgangsforespørsel {
  navn: string
  arbeidsforhold: Arbeidsforhold
  rettighet: Rettighet
  påVegneAvKommune: Kommune | undefined
}

export interface InnsendtTilgangsforespørsel extends Tilgangsforespørsel {
  status: Tilgangsforespørselstatus
}

export enum Rettighet {
  DELBESTILLING = 'DELBESTILLING',
}

export interface Arbeidsforhold {
  overordnetOrganisasjon: Organisasjon
  organisasjon: Organisasjon
  stillingstittel: string
  kommune: Kommune
}

export interface Kommune {
  fylkesnummer: string | undefined
  fylkesnavn: string | undefined
  kommunenummer: string
  kommunenavn: string
  fylkenummer: string
  fylkenavn: string
}

export enum Tilgangsforespørselstatus {
  AVVENTER_BEHANDLING = 'AVVENTER_BEHANDLING',
  GODKJENT = 'GODKJENT',
  AVSLÅTT = 'AVSLÅTT',
}

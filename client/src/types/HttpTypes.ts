import { Del, Delbestillerrolle, Delbestilling, DelbestillingSak, Hjelpemiddel, Pilot } from './Types'

export interface OppslagRequest {
  hmsnr: string
  serienr: string
}

export interface OppslagResponse {
  hjelpemiddel: Hjelpemiddel | undefined
  feil: OppslagFeil | undefined
  piloter: Pilot[]
}

export interface AlleHjelpemidlerMedDelerResponse {
  hjelpemidlerMedDeler: Hjelpemiddel[]
}

export interface HjelpemiddelTitlerResponse {
  titler: string[]
}

export interface DellisteResponse {
  sistOppdatert: string
  deler: DellisteDel[]
}

export interface XKLagerResponse {
  xkLager: boolean
}

export interface SisteBatteribestillingResponse {
  antallDagerSiden: number
}

export interface DellisteDel {
  hmsnr: string
  navn: string
  hjmNavn: string
  lagtTil: string
}

export enum OppslagFeil {
  'TILBYR_IKKE_HJELPEMIDDEL' = 'TILBYR_IKKE_HJELPEMIDDEL',
  'INGET_UTLÅN' = 'INGET_UTLÅN',
  'IKKE_HOVEDHJELPEMIDDEL' = 'IKKE_HOVEDHJELPEMIDDEL',
}

export interface DelbestillingRequest {
  delbestilling: Delbestilling
}

export interface DelbestillingResponse {
  id: string
  feil: DelbestillingFeil | null
  saksnummer: number | null
  delbestillingSak: DelbestillingSak | null
}

export enum DelbestillingFeil {
  'INGET_UTLÅN' = 'INGET_UTLÅN',
  'ULIK_GEOGRAFISK_TILKNYTNING' = 'ULIK_GEOGRAFISK_TILKNYTNING',
  'BRUKER_IKKE_FUNNET' = 'BRUKER_IKKE_FUNNET',
  'KAN_IKKE_BESTILLE' = 'KAN_IKKE_BESTILLE',
  'BESTILLE_TIL_SEG_SELV' = 'BESTILLE_TIL_SEG_SELV',
  'FOR_MANGE_BESTILLINGER_SISTE_24_TIMER' = 'FOR_MANGE_BESTILLINGER_SISTE_24_TIMER',
  'ULIK_ADRESSE_PDL_OEBS' = 'ULIK_ADRESSE_PDL_OEBS',
}

export interface DelbestillerrolleResponse {
  delbestillerrolle: Delbestillerrolle
}

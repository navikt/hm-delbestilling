import { Hjelpemiddel } from './Types'

export interface OppslagResponse {
  hjelpemiddel: Hjelpemiddel | undefined
  feil: OppslagFeil | undefined
}

export enum OppslagFeil {
  'TILBYR_IKKE_HJELPEMIDDEL' = 'TILBYR_IKKE_HJELPEMIDDEL',
  'INGET_UTLÅN' = 'INGET_UTLÅN',
}

export interface DelbestillerResponse {
  kanBestilleDeler: boolean
  harXKLager: boolean
  erKommunaltAnsatt: boolean
  erIPilot: boolean
}

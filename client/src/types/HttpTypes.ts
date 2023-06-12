import { Delbestillerrolle, Delbestilling } from './Types'
import { Hjelpemiddel } from './Types'

export interface OppslagRequest {
  hmsnr: string
  serienr: string
}

export interface OppslagResponse {
  hjelpemiddel: Hjelpemiddel | undefined
  feil: OppslagFeil | undefined
}

export enum OppslagFeil {
  'TILBYR_IKKE_HJELPEMIDDEL' = 'TILBYR_IKKE_HJELPEMIDDEL',
  'INGET_UTLÅN' = 'INGET_UTLÅN',
}

export interface DelbestillingRequest {
  delbestilling: Delbestilling
}

export interface DelbestillingResponse {
  id: string
  feil?: DelbestillingFeil
}

export enum DelbestillingFeil {
  'INGET_UTLÅN' = 'INGET_UTLÅN',
  'ULIK_GEOGRAFISK_TILKNYTNING' = 'ULIK_GEOGRAFISK_TILKNYTNING',
  'BRUKER_IKKE_FUNNET' = 'BRUKER_IKKE_FUNNET',
  'KAN_IKKE_BESTILLE' = 'KAN_IKKE_BESTILLE',
  'BESTILLE_TIL_SEG_SELV' = 'BESTILLE_TIL_SEG_SELV',
}

export interface DelbestillerrolleResponse {
  delbestillerrolle: Delbestillerrolle
}

import { Hjelpemiddel } from './Types'

export interface DelbestillerResponse {
  kanBestilleDeler: boolean
  harXKLager: boolean
  erKommunaltAnsatt: boolean
  erIPilot: boolean
}

export interface OppslagResponse {
  hjelpemiddel?: Hjelpemiddel
  serieNrKobletMotBruker: boolean
}

import { Hjelpemiddel } from './Types'

export interface OppslagResponse {
  hjelpemiddel?: Hjelpemiddel
  serienrKobletMotBruker: boolean
}

export interface DelbestillerResponse {
  kanBestilleDeler: boolean
  harXKLager: boolean
  erKommunaltAnsatt: boolean
  erIPilot: boolean
}

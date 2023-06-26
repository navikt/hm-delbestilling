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
}

export interface HjelpeMidler {
  hjelpemidlerMedDeler: Hjelpemiddel[]
}

export interface HjelpemiddelKategori {
  navn: string
  antallTilgjengeligeDeler: number
  deler?: Del[]
}

export enum Levering {
  'TIL_XK_LAGER' = 'TIL_XK_LAGER',
  'TIL_SERVICE_OPPDRAG' = 'TIL_SERVICE_OPPDRAG',
}

export interface Delbestillerrolle {
  kanBestilleDeler: boolean
  harXKLager: boolean
  erKommunaltAnsatt: boolean
  erIPilot: boolean
}

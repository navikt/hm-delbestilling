export interface Hjelpemiddel {
  navn: string
  hmsnr: string
  deler: HjelpemiddelDel[] | undefined
}

export interface HjelpemiddelDel {
  navn: string
  beskrivelse: string
  hmsnr: string
  levArtNr: string
  img: string
  kategori: string
}

export interface Handlekurv {
  id: string
  serienr: string
  hjelpemiddel: Hjelpemiddel
  deler: DelBestillingDel[]
  levering: Levering | undefined
}

export interface DelBestillingDel extends HjelpemiddelDel {
  antall: number
}

export interface Delbestilling {
  id: string
  hmsnr: string
  serienr: string
  deler: DelBestillingDel[]
  levering: Levering
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

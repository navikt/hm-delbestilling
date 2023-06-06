export interface Hjelpemiddel {
  navn: string
  hmsnr: string
  deler: Del[] | undefined
}

export interface Del {
  navn: string
  beskrivelse: string
  hmsnr: string
  levArtNr: string
  img: string
  kategori: string
}

export interface Bestilling {
  id: string
  hjelpemiddel: Hjelpemiddel
  handlekurv: Handlekurv
}

export interface Handlekurv {
  serienr: string
  deler: BestillingDel[]
}

export interface BestillingDel extends Del {
  antall: number
}

export interface InnsendtBestilling {
  id: string
  hmsnr: string
  serienr: string
  deler: BestillingDel[]
}

export interface InnsendtBestillingResponse {
  id: string
  feil?: InnsendtBestillingFeil
}

export enum InnsendtBestillingFeil {
  'INGET_UTLÅN' = 'INGET_UTLÅN',
  'ULIK_GEOGRAFISK_TILKNYTNING' = 'ULIK_GEOGRAFISK_TILKNYTNING',
}

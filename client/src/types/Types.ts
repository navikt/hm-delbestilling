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

export interface Handlekurv {
  id: string
  serienr: string
  hjelpemiddel: Hjelpemiddel
  deler: DelBestillingDel[]
}

export interface DelBestillingDel extends Del {
  antall: number
}

export interface Delbestilling {
  id: string
  hmsnr: string
  serienr: string
  deler: DelBestillingDel[]
}

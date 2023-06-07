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
}

export interface DelBestillingDel extends HjelpemiddelDel {
  antall: number
}

export interface Delbestilling {
  id: string
  hmsnr: string
  serienr: string
  deler: DelBestillingDel[]
}

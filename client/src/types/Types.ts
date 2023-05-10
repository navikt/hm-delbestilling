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

// TODO: dette føles klønete...
export interface Delbestilling extends Del {
  antall: number
}

export interface Handlekurv {
  serieNr: string
  deler: Delbestilling[]
}

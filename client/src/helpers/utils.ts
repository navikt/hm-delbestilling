import { HjelpemiddelV2 } from "../types/Types"

export const formaterNorskDato = (dato: string) =>
  new Date(dato).toLocaleString('no', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const erBareTall = (input: string): boolean => {
  return input === '' || /^[0-9]+$/.test(input)
}

const innenforMaksLengde = (input: string, maksLengde: number): boolean => {
  return input.length <= maksLengde
}

const erGyldig = (input: string, maksLengde: number) => innenforMaksLengde(input, maksLengde) && erBareTall(input)

export const erGyldigSerienr = (input: string) => erGyldig(input, 6)

export const erGyldigArtnr = (input: string) => erGyldig(input, 6)

export const erGyldigBrukernr = (input: string) => erGyldig(input, 8)

export const erSerienummerstyrt = (isokode: string): boolean => {

  const serienummerstyrteIso4koder = [
    '1222', // Manuelle rullestoler
    '1223', // Elektriske rullestoler
    '1236', // Personløftere
    '1830', // Heiser og løfteplattformer
  ]

  const serienummerstyrteIso6koder = [
    "181204", // "Senger og løse sengebunner/støtteplater for madrass uten reguleringsmulighet",
    "181207", // "Senger og løse sengebunner/støtteplater for madrass med manuell regulering",
    "181210", // "Senger og løse sengebunner/støtteplater for madrass med elektrisk regulering",
    "220318", // "Bildeforstørrende videosystemer (lese-TV)",
  ]


  const iso4kode = isokode.substring(0, 4)
  const iso6kode = isokode.substring(0, 6)

  return serienummerstyrteIso4koder.includes(iso4kode) || serienummerstyrteIso6koder.includes(iso6kode)

}
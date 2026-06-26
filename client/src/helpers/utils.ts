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

const erGyldig = (input: string, maksLengde: number = 6) => innenforMaksLengde(input, maksLengde) && erBareTall(input)

export const erGyldigArtnr = (input: string) => erGyldig(input, 6)
export const erGyldigSerienr = (input: string) => erGyldig(input, 6)
export const erGyldigBrukernr = (input: string) => erGyldig(input, 8)
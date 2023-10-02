export const formaterNorskDato = (dato: string) =>
  new Date(dato).toLocaleString('no', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

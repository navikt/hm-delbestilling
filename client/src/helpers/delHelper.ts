import { Del, DelLinje } from '../types/Types'

const defaultAntallPerKategori: { [key: string]: number } = {
  Batteri: 2,
  Dekk: 2,
  Hjul: 2,
  Svinghjul: 2,
}

export function defaultAntall(del: Del): number {
  const { kategori } = del
  if (kategori in defaultAntallPerKategori) {
    return defaultAntallPerKategori[kategori]
  }
  return 1
}

export const hentAntallDeler = (delLinjer: DelLinje[]): number => {
  return delLinjer.reduce((acc, curr) => {
    return acc + curr.antall
  }, 0)
}

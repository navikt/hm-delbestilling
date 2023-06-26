import { useEffect, useMemo, useState } from 'react'
import { HjelpemiddelKategori } from '../types/Types'
import rest from '../services/rest'

export const useHjelpemidleKategori = () => {
  const [aktivtHjelpemiddel, setAktivtHjelpemiddel] = useState<HjelpemiddelKategori | undefined>()
  const [hjelpemidler, setHjelpemidler] = useState<HjelpemiddelKategori[]>([])
  useEffect(() => {
    rest
      .hentAlleHjelpemidlerMedDeler()
      .then((result) => result.hjelpemidlerMedDeler)
      .then((hjelpemidler) => {
        const hjelpemiddelKategorier: Record<string, HjelpemiddelKategori> = {}
        hjelpemidler.forEach((hjelpemiddel) => {
          if (!hjelpemiddelKategorier[hjelpemiddel.navn]) {
            hjelpemiddelKategorier[hjelpemiddel.navn] = {
              navn: hjelpemiddel.navn,
              antallTilgjengeligeDeler: hjelpemiddel.deler?.length || 0,
              deler: hjelpemiddel.deler,
            }
          }
        })
        return Object.values(hjelpemiddelKategorier)
      })
      .then((hjelpemidler) => {
        setHjelpemidler(hjelpemidler)
        setAktivtHjelpemiddel(hjelpemidler[0])
      })
  }, [])
  return { hjelpemidler, aktivtHjelpemiddel, setAktivtHjelpemiddel }
}

export const useHjelpemidlerKategoriUtvalg = (
  alleHjelpemidler: HjelpemiddelKategori[],
  søkeUtrykk: string,
  maksHjelpemidler: number
) => {
  const [side, setSide] = useState(1)

  const hjelpemiddelUtvalgEtterSøk = useMemo(() => {
    return søkeUtrykk.length > 0
      ? alleHjelpemidler.filter(({ navn }) => navn.toLowerCase().includes(søkeUtrykk.toLowerCase()))
      : alleHjelpemidler
  }, [søkeUtrykk, alleHjelpemidler])
  const hjelpemidlerUtvalg = useMemo(() => {
    return hjelpemiddelUtvalgEtterSøk.slice((side - 1) * maksHjelpemidler, side * maksHjelpemidler)
  }, [side, søkeUtrykk, alleHjelpemidler])

  const antallSider = useMemo(() => {
    return Math.ceil(hjelpemiddelUtvalgEtterSøk.length / maksHjelpemidler)
  }, [hjelpemiddelUtvalgEtterSøk.length])

  useEffect(() => {
    if (antallSider < side) {
      setSide(Math.max(1, antallSider))
    }
  }, [side, hjelpemiddelUtvalgEtterSøk.length])

  return {
    side,
    setSide,
    antallSider,
    hjelpemidlerUtvalg,
  }
}

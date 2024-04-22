import { useEffect, useMemo, useState } from 'react'

import rest from '../services/rest'
import { Hjelpemiddel } from '../types/Types'

const MAKS_HJELPEMIDLER = 5

export const useHjelpemidler = () => {
  const [aktivtHjelpemiddel, setAktivtHjelpemiddel] = useState<Hjelpemiddel | undefined>()
  const [hjelpemidler, setHjelpemidler] = useState<Hjelpemiddel[]>([])
  const [henterHjelpemidler, setHenterHjelpemidler] = useState(false)
  useEffect(() => {
    setHenterHjelpemidler(true)
    rest
      .hentAlleHjelpemidlerMedDeler()
      .then((result) => result.hjelpemidlerMedDeler)
      .then((hjelpemidler) => {
        const hjelpemiddelRedusert: Record<string, Hjelpemiddel> = {}
        hjelpemidler.forEach((hjelpemiddel) => {
          if (!hjelpemiddelRedusert[hjelpemiddel.navn]) {
            hjelpemiddelRedusert[hjelpemiddel.navn] = hjelpemiddel
          }
        })
        return Object.values(hjelpemiddelRedusert)
      })
      .then((hjelpemidler) => {
        setHjelpemidler(hjelpemidler)
        setAktivtHjelpemiddel(hjelpemidler[0])
      })
      .finally(() => {
        setHenterHjelpemidler(false)
      })
  }, [])
  return { hjelpemidler, aktivtHjelpemiddel, setAktivtHjelpemiddel, henterHjelpemidler }
}

export const useHjelpemidlerUtvalg = (
  aktivtHjelpemiddel: Hjelpemiddel | undefined,
  alleHjelpemidler: Hjelpemiddel[],
  søkeUtrykk: string
) => {
  const [side, setSide] = useState(1)

  const hjelpemiddelUtvalgEtterSøk = useMemo(() => {
    return søkeUtrykk && søkeUtrykk.length > 0
      ? alleHjelpemidler.filter(({ navn }) => navn.toLowerCase().includes(søkeUtrykk.toLowerCase()))
      : alleHjelpemidler
  }, [søkeUtrykk, alleHjelpemidler])
  const hjelpemidlerUtvalg = useMemo(() => {
    return hjelpemiddelUtvalgEtterSøk.slice((side - 1) * MAKS_HJELPEMIDLER, side * MAKS_HJELPEMIDLER)
  }, [side, søkeUtrykk, alleHjelpemidler])

  const antallSider = useMemo(() => {
    return Math.ceil(hjelpemiddelUtvalgEtterSøk.length / MAKS_HJELPEMIDLER)
  }, [hjelpemiddelUtvalgEtterSøk.length])

  useEffect(() => {
    const aktivtHjelpemiddelIndex = hjelpemiddelUtvalgEtterSøk
      .map(({ navn }) => navn)
      .indexOf(aktivtHjelpemiddel?.navn || '')
    if (aktivtHjelpemiddelIndex >= 0) {
      const sideMedAktivtHjelpemiddel = Math.floor(aktivtHjelpemiddelIndex / MAKS_HJELPEMIDLER) + 1
      setSide(sideMedAktivtHjelpemiddel)
    } else if (antallSider < side) {
      setSide(Math.max(1, antallSider))
    }
  }, [hjelpemiddelUtvalgEtterSøk.length, aktivtHjelpemiddel])

  return {
    side,
    setSide,
    antallSider,
    hjelpemidlerUtvalg,
  }
}

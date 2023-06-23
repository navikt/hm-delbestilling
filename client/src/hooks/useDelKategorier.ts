import { useEffect, useMemo, useState } from 'react'
import { Hjelpemiddel } from '../types/Types'

const useDelKategorier = (hjelpemiddel?: Hjelpemiddel) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()
  const delKategorier = useMemo(() => {
    if (hjelpemiddel && hjelpemiddel.deler) {
      return hjelpemiddel.deler.reduce((acc, del) => {
        if (!acc.includes(del.kategori)) {
          acc.push(del.kategori)
        }
        return acc
      }, [] as string[])
    }
  }, [hjelpemiddel])
  useEffect(() => setKategoriFilter(undefined), [hjelpemiddel])
  return { kategoriFilter, setKategoriFilter, delKategorier }
}

export default useDelKategorier

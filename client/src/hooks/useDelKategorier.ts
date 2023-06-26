import { useEffect, useMemo, useState } from 'react'
import { HjelpemiddelKategori } from '../types/Types'

const useDelKategorier = (hjelpemiddelKategori?: HjelpemiddelKategori) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()
  const delKategorier = useMemo(() => {
    if (hjelpemiddelKategori && hjelpemiddelKategori.deler) {
      return hjelpemiddelKategori.deler.reduce((acc, del) => {
        if (!acc.includes(del.kategori)) {
          acc.push(del.kategori)
        }
        return acc
      }, [] as string[])
    }
  }, [hjelpemiddelKategori])
  useEffect(() => setKategoriFilter(undefined), [hjelpemiddelKategori])
  return { kategoriFilter, setKategoriFilter, delKategorier }
}

export default useDelKategorier

import { useEffect, useMemo, useState } from 'react'

import { Del } from '../types/Types'

const useDelKategorier = (deler: Del[] | undefined) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()
  const delKategorier = useMemo(() => {
    if (deler) {
      return deler.reduce((acc, del) => {
        if (!acc.includes(del.kategori)) {
          acc.push(del.kategori)
        }
        return acc
      }, [] as string[])
    }
  }, [deler])
  useEffect(() => setKategoriFilter(undefined), [deler])
  return { kategoriFilter, setKategoriFilter, delKategorier }
}

export default useDelKategorier
